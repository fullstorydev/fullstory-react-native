# Finds how an app's Podfile adds the FullStory pod, so a podspec can warn
# when it would come from CocoaPods trunk, which no longer gets new versions.
#
# The source of truth lives in nativemobile/tools/cocoapods in cowpaths/mn.
# fullstory_flutter ships it through a symlink in its ios/ folder.
# @fullstory/react-native (fullstorydev/fullstory-react-native) keeps a copy at
# its root, so change both together. Tests: test/fullstory_podfile_check_test.rb.
module FullStoryPodfileCheck
  # CocoaPods setup steps, linked from the podspec warnings. The anchor is the
  # Setup heading. Once the "via CocoaPods Pod" accordion header has its own id,
  # point the anchor at that id and the page will open that section.
  SETUP_URL = 'https://help.fullstory.com/hc/en-us/articles/360042772333-Getting-Started-with-iOS-Data-Capture#h_01HR5544X1RQRHWNBD0K341G58'

  # Options that point the pod somewhere other than trunk.
  SOURCE_OPTION = /(:(http|path|git|podspec)\s*=>|\b(http|path|git|podspec):)/
  POD_LINE = /^\s*pod\s*\(?\s*['"]FullStory['"]/
  # "pod(" with the name on the next line.
  POD_OPEN_PAREN = /^\s*pod\s*\(\s*$/
  NAME_LINE = /^\s*['"]FullStory['"]/
  # A pod call can span lines, but not many.
  MAX_STATEMENT_LINES = 10
  # Set to 1 to warn instead of failing when FullStory would come from trunk.
  ALLOW_TRUNK_ENV = 'FS_ALLOW_TRUNK'

  # Raised when FullStory would come from trunk. A subclass of Pod::Informative,
  # when CocoaPods is loaded, so pod install shows the message without a trace.
  base = defined?(Pod::Informative) ? Pod::Informative : StandardError
  TrunkError = Class.new(base)

  # Returns [source, statement]. source is :none (no FullStory pod), :url (it
  # names a source like :http) or :trunk (a bare name or version). statement is
  # the full pod call on one line, or nil.
  def self.source(podfile_text)
    lines = podfile_text.lines
    start = lines.each_index.find do |i|
      lines[i] =~ POD_LINE || (lines[i] =~ POD_OPEN_PAREN && lines[i + 1].to_s =~ NAME_LINE)
    end
    return [:none, nil] unless start

    statement = ''
    lines[start, MAX_STATEMENT_LINES].each do |line|
      # Drop a comment, whether it starts the line or follows code.
      code = line.sub(/(^|\s)#.*$/, '').strip
      # A blank or comment-only line inside a wrapped call doesn't end it.
      next if code.empty?

      statement << ' ' << code
      # Keep reading while the call clearly goes on to the next line.
      break unless code.end_with?(',', '\\', '(', '=>', ':')
    end
    statement = statement.strip
    [statement =~ SOURCE_OPTION ? :url : :trunk, statement]
  end

  # Reads the Podfile at path. Returns :unknown, with the error message as the
  # statement, if the Podfile can't be found, read or checked, so a broken
  # check never stops pod install.
  def self.read(path)
    return [:unknown, 'no Podfile found'] unless path && File.file?(path)
    source(File.read(path))
  rescue StandardError, ScriptError => e
    [:unknown, "#{e.class}: #{e.message}"]
  end

  # Acts on what read returned. Fails with message when FullStory would come
  # from trunk, unless FS_ALLOW_TRUNK=1. Warns when the Podfile couldn't
  # be checked. Returns true when it warned instead of failing.
  def self.trunk_check!(source, statement, message, env: ENV, ui: defined?(Pod::UI) ? Pod::UI : nil)
    case source
    when :unknown
      ui&.warn "[FullStory] Couldn't check your Podfile (#{statement}). If FullStory comes from " \
               "CocoaPods trunk, it won't get new versions. Setup steps: #{SETUP_URL}"
      true
    when :trunk, :none
      if env[ALLOW_TRUNK_ENV] == '1'
        ui&.warn "#{message} (Continuing because #{ALLOW_TRUNK_ENV}=1.)"
        true
      else
        raise TrunkError, "#{message} To build anyway, set #{ALLOW_TRUNK_ENV}=1."
      end
    else
      false
    end
  end

  # The version in a FullStory xcframework URL, or nil.
  def self.url_version(statement)
    statement && statement[/fullstory-([\d.]+)-xcframework/, 1]
  end
end
