# Finds how an app's Podfile adds the FullStory pod, so a podspec can fail when
# it would come from CocoaPods trunk.
#
# Lives in nativemobile/tools/cocoapods in cowpaths/mn. fullstory_flutter ships
# it through a symlink, and @fullstory/react-native keeps a copy, so change both.
module FullStoryPodfileCheck
  SETUP_URL = 'https://help.fullstory.com/hc/en-us/articles/360042772333-Getting-Started-with-iOS-Data-Capture#01FP0FKAH2WAPFHK0JQK9CVCFT'

  # Options that point the pod somewhere other than trunk.
  SOURCE_OPTION = /(:(http|path|git|podspec)\s*=>|\b(http|path|git|podspec):)/
  POD_LINE = /^\s*pod\s*\(?\s*['"]FullStory['"]/
  # "pod(" with the name on the next line.
  POD_OPEN_PAREN = /^\s*pod\s*\(\s*$/
  NAME_LINE = /^\s*['"]FullStory['"]/
  MAX_STATEMENT_LINES = 10
  # Set to 1 to warn instead of failing.
  ALLOW_TRUNK_ENV = 'FS_ALLOW_TRUNK'

  # Pod::Informative, when CocoaPods is loaded, so pod install shows a message
  # instead of a crash.
  base = defined?(Pod::Informative) ? Pod::Informative : StandardError
  TrunkError = Class.new(base)

  # Returns [source, statement]. source is :none (no FullStory pod), :url (names
  # a source like :http) or :trunk (a bare name or version). statement is the
  # pod call joined onto one line.
  def self.source(podfile_text)
    lines = podfile_text.lines
    start = lines.each_index.find do |i|
      lines[i] =~ POD_LINE || (lines[i] =~ POD_OPEN_PAREN && lines[i + 1].to_s =~ NAME_LINE)
    end
    return [:none, nil] unless start

    statement = ''
    lines[start, MAX_STATEMENT_LINES].each do |line|
      code = line.sub(/(^|\s)#.*$/, '').strip
      # A blank or comment line inside a wrapped call doesn't end it.
      next if code.empty?

      statement << ' ' << code
      break unless code.end_with?(',', '\\', '(', '=>', ':')
    end
    statement = statement.strip
    [statement =~ SOURCE_OPTION ? :url : :trunk, statement]
  end

  # Like source, but returns :unknown with the reason if the Podfile can't be
  # found or checked, so a broken check never stops pod install.
  def self.read(path)
    return [:unknown, 'no Podfile found'] unless path && File.file?(path)
    source(File.read(path))
  rescue StandardError, ScriptError => e
    [:unknown, "#{e.class}: #{e.message}"]
  end

  # Raises with message when FullStory would come from trunk, unless
  # FS_ALLOW_TRUNK=1. Warns when the Podfile couldn't be checked.
  def self.trunk_check!(source, statement, message, env: ENV, ui: defined?(Pod::UI) ? Pod::UI : nil)
    case source
    when :unknown
      ui&.warn "[FullStory] Couldn't check your Podfile (#{statement}). If FullStory comes from " \
               "CocoaPods trunk, it won't get new versions. Setup steps: #{SETUP_URL}"
    when :trunk, :none
      raise TrunkError, "#{message} To build anyway, set #{ALLOW_TRUNK_ENV}=1." unless env[ALLOW_TRUNK_ENV] == '1'

      ui&.warn "#{message} (Continuing because #{ALLOW_TRUNK_ENV}=1.)"
    end
  end

  def self.url_version(statement)
    statement && statement[/fullstory-([\d.]+)-xcframework/, 1]
  end
end
