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
      code = line.sub(/\s#.*$/, '').strip
      statement << ' ' << code
      # Keep reading while the call clearly goes on to the next line.
      break unless code.end_with?(',', '\\', '(', '=>', ':')
    end
    statement = statement.strip
    [statement =~ SOURCE_OPTION ? :url : :trunk, statement]
  end

  # Reads the Podfile at path. A missing or unreadable file counts as :none.
  def self.read(path)
    return [:none, nil] unless path && File.file?(path)
    source(File.read(path))
  rescue StandardError => e
    Pod::UI.puts "[FullStory] Couldn't read Podfile at #{path.inspect}: #{e.message}" if defined?(Pod::UI)
    [:none, nil]
  end

  # The version in a FullStory xcframework URL, or nil.
  def self.url_version(statement)
    statement && statement[/fullstory-([\d.]+)-xcframework/, 1]
  end
end
