# Tests for fullstory_podfile_check.rb. The same file runs in cowpaths/mn and
# @fullstory/react-native, so it keeps the two copies of the check in step.
require 'minitest/autorun'
require 'tmpdir'

require File.expand_path('../fullstory_podfile_check.rb', __dir__)

class FullStoryPodfileCheckTest < Minitest::Test
  URL = 'https://ios-releases.fullstory.com/fullstory-1.76.0-xcframework.tar.gz'

  def source_of(podfile)
    FullStoryPodfileCheck.source(podfile)[0]
  end

  # No FullStory pod at all.

  def test_empty_podfile
    assert_equal :none, source_of('')
  end

  def test_no_fullstory_line
    assert_equal :none, source_of("target 'App' do\n  pod 'Alamofire'\nend\n")
  end

  def test_commented_out_line
    assert_equal :none, source_of("  # pod 'FullStory', :http => '#{URL}'\n")
  end

  def test_wrong_case_is_not_ours
    # CocoaPods fails on this name anyway, so don't guess.
    assert_equal :none, source_of("  pod 'Fullstory', '1.76.0'\n")
  end

  def test_other_pod_starting_with_fullstory
    assert_equal :none, source_of("  pod 'FullStoryGuidesAndSurveys', '0.1.6'\n")
  end

  # FullStory comes from trunk.

  def test_bare_name
    assert_equal :trunk, source_of("  pod 'FullStory'\n")
  end

  def test_version_only
    assert_equal :trunk, source_of("  pod 'FullStory', '~> 1.76.0'\n")
  end

  def test_double_quotes
    assert_equal :trunk, source_of("  pod \"FullStory\", \"1.76.0\"\n")
  end

  def test_parentheses
    assert_equal :trunk, source_of("  pod('FullStory', '1.76.0')\n")
  end

  def test_trailing_comment_mentioning_http
    assert_equal :trunk, source_of("  pod 'FullStory', '~> 1.76' # TODO: switch to :http => '#{URL}'\n")
  end

  # FullStory comes from somewhere other than trunk.

  def test_http_one_line
    assert_equal :url, source_of("  pod 'FullStory', :http => '#{URL}'\n")
  end

  def test_http_split_after_comma
    assert_equal :url, source_of("  pod 'FullStory',\n      :http => '#{URL}'\n")
  end

  def test_http_new_hash_syntax
    assert_equal :url, source_of("  pod 'FullStory', http: '#{URL}'\n")
  end

  def test_path
    # Our RN85-88 apps use the header-only pod this way.
    assert_equal :url, source_of("  pod 'FullStory', :path => '../../../pods/FullStory'\n")
  end

  def test_path_built_from_env
    assert_equal :url, source_of("  pod 'FullStory', :path => ENV['FS_HOME'] + '/nativemobile/ReactNative/pods/FullStory'\n")
  end

  def test_podspec
    assert_equal :url, source_of("  pod 'FullStory', :podspec => 'https://example.com/FullStory.podspec'\n")
  end

  def test_git
    assert_equal :url, source_of("  pod 'FullStory', :git => 'https://example.com/fullstory.git'\n")
  end

  # Indentation before "pod" doesn't matter.

  INDENTS = {
    'none' => '',
    'spaces' => '    ',
    'tab' => "\t",
    'mixed tab and spaces' => " \t ",
  }

  INDENTS.each do |name, indent|
    define_method("test_indent_#{name.tr(' ', '_')}_version_only") do
      assert_equal :trunk, source_of("#{indent}pod 'FullStory', '~> 1.76.0'\n")
    end

    define_method("test_indent_#{name.tr(' ', '_')}_http") do
      assert_equal :url, source_of("#{indent}pod 'FullStory', :http => '#{URL}'\n")
    end

    define_method("test_indent_#{name.tr(' ', '_')}_http_wrapped") do
      podfile = "#{indent}pod 'FullStory',\n#{indent}    :http => '#{URL}'\n"
      assert_equal :url, source_of(podfile)
    end
  end

  def test_extra_spaces_between_pod_and_name
    assert_equal :url, source_of("  pod   'FullStory',   :http   =>   '#{URL}'\n")
  end

  def test_space_before_parenthesis
    assert_equal :url, source_of("  pod ('FullStory', :http => '#{URL}')\n")
  end

  def test_podfile_with_windows_line_endings
    assert_equal :url, source_of("target 'App' do\r\n  pod 'FullStory', :http =>\r\n    '#{URL}'\r\nend\r\n")
  end

  # Calls that wrap onto more lines.

  def test_wrapped_each_argument_on_own_line
    podfile = "  pod(\n    'FullStory',\n    :http => '#{URL}'\n  )\n"
    assert_equal :url, source_of(podfile)
  end

  def test_wrapped_with_backslash
    podfile = "  pod 'FullStory', \\\n    :http => '#{URL}'\n"
    assert_equal :url, source_of(podfile)
  end

  def test_wrapped_over_three_lines
    podfile = "  pod 'FullStory',\n    :http =>\n      '#{URL}'\n"
    assert_equal :url, source_of(podfile)
    _, statement = FullStoryPodfileCheck.source(podfile)
    assert_equal '1.76.0', FullStoryPodfileCheck.url_version(statement)
  end

  def test_wrapped_with_comment_between_lines
    podfile = "  pod 'FullStory', # our SDK\n    :http => '#{URL}'\n"
    assert_equal :url, source_of(podfile)
  end

  def test_wrapped_with_comment_only_line
    podfile = "  pod 'FullStory',\n    # pinned to our release bucket\n    :http => '#{URL}'\n"
    assert_equal :url, source_of(podfile)
  end

  def test_wrapped_with_unindented_comment_line
    podfile = "  pod 'FullStory',\n# note\n    :path => '../pods/FullStory'\n"
    assert_equal :url, source_of(podfile)
  end

  def test_wrapped_with_blank_line
    podfile = "  pod 'FullStory',\n\n    :http => '#{URL}'\n"
    assert_equal :url, source_of(podfile)
  end

  def test_wrapped_with_comment_line_keeps_url_version
    podfile = "  pod 'FullStory', :http =>\n    # 1.75.2 until the fix ships\n    'https://ios-releases.fullstory.com/fullstory-1.75.2-xcframework.tar.gz'\n"
    _, statement = FullStoryPodfileCheck.source(podfile)
    assert_equal '1.75.2', FullStoryPodfileCheck.url_version(statement)
  end

  def test_blank_line_after_finished_call_does_not_join_next_pod
    podfile = "  pod 'FullStory', '1.76.0'\n\n  pod 'Other', :http => 'https://example.com/other.tar.gz'\n"
    assert_equal :trunk, source_of(podfile)
  end

  def test_hash_inside_url_is_kept
    _, statement = FullStoryPodfileCheck.source("  pod 'FullStory', :http => 'https://example.com/fullstory-1.76.0-xcframework.tar.gz#sha'\n")
    assert_equal '1.76.0', FullStoryPodfileCheck.url_version(statement)
  end

  def test_wrapped_version_only_stays_trunk
    podfile = "  pod 'FullStory',\n    '~> 1.76.0'\n"
    assert_equal :trunk, source_of(podfile)
  end

  def test_wrapped_version_then_options
    podfile = "  pod 'FullStory', '1.76.0',\n    :configurations => ['Release']\n"
    assert_equal :trunk, source_of(podfile)
  end

  def test_wrap_ends_before_next_pod
    podfile = "  pod 'FullStory', '1.76.0'\n  pod 'Other',\n    :http => 'https://example.com/other.tar.gz'\n"
    assert_equal :trunk, source_of(podfile)
  end

  # The statement and version that the podspecs print.

  def test_statement_joins_multiline_call
    # Our RN66 and Capacitor apps write it this way.
    source, statement = FullStoryPodfileCheck.source("  pod 'FullStory', :http =>\n  '#{URL}'\n")
    assert_equal :url, source
    assert_equal "pod 'FullStory', :http => '#{URL}'", statement
  end

  def test_url_version
    _, statement = FullStoryPodfileCheck.source("  pod 'FullStory', :http => '#{URL}'\n")
    assert_equal '1.76.0', FullStoryPodfileCheck.url_version(statement)
  end

  def test_url_on_next_line_after_new_hash_syntax
    _, statement = FullStoryPodfileCheck.source("  pod 'FullStory', http:\n    '#{URL}'\n")
    assert_equal '1.76.0', FullStoryPodfileCheck.url_version(statement)
  end

  def test_url_version_without_url
    assert_nil FullStoryPodfileCheck.url_version("pod 'FullStory', '1.76.0'")
    assert_nil FullStoryPodfileCheck.url_version(nil)
  end

  def test_only_first_fullstory_statement_counts
    podfile = "  pod 'FullStory', '1.76.0'\n  pod 'FullStory', :http => '#{URL}'\n"
    assert_equal :trunk, source_of(podfile)
  end

  def test_unterminated_call_stops_at_limit
    podfile = "  pod 'FullStory',\n" + ("    # nothing,\n" * 20) + "    :http => '#{URL}'\n"
    assert_equal :trunk, source_of(podfile)
  end

  # Reading from disk.

  def test_read_missing_file_is_unknown
    assert_equal :unknown, FullStoryPodfileCheck.read('/no/such/Podfile')[0]
  end

  def test_read_nil_path_is_unknown
    assert_equal :unknown, FullStoryPodfileCheck.read(nil)[0]
  end

  def test_read_real_file
    Dir.mktmpdir do |dir|
      path = File.join(dir, 'Podfile')
      File.write(path, "  pod 'FullStory', :http => '#{URL}'\n")
      assert_equal :url, FullStoryPodfileCheck.read(path)[0]
    end
  end

  def test_read_unreadable_file_is_unknown
    Dir.mktmpdir do |dir|
      path = File.join(dir, 'Podfile')
      File.write(path, "  pod 'FullStory'\n")
      File.chmod(0o000, path)
      skip 'running as a user that can read any file' if File.readable?(path)
      source, detail = FullStoryPodfileCheck.read(path)
      assert_equal :unknown, source
      assert_match(/Permission denied/, detail)
    end
  end

  def test_read_never_raises_when_parsing_fails
    Dir.mktmpdir do |dir|
      path = File.join(dir, 'Podfile')
      # Not valid UTF-8, so the regex match raises inside source.
      File.binwrite(path, "  pod 'FullStory'\xff\n".b)
      source, detail = FullStoryPodfileCheck.read(path)
      assert_equal :unknown, source
      assert_match(/ArgumentError/, detail)
    end
  end

  # Acting on the result.

  class FakeUI
    attr_reader :warnings

    def initialize
      @warnings = []
    end

    def warn(message)
      @warnings << message
    end
  end

  # Returns the warnings trunk_check! printed.
  def check(source, env: {}, statement: nil)
    ui = FakeUI.new
    FullStoryPodfileCheck.trunk_check!(source, statement, 'trunk message', env: env, ui: ui)
    ui.warnings
  end

  def test_url_source_passes_quietly
    assert_empty check(:url)
  end

  def test_trunk_line_raises
    error = assert_raises(FullStoryPodfileCheck::TrunkError) { check(:trunk) }
    assert_match(/trunk message/, error.message)
    assert_match(/FS_ALLOW_TRUNK=1/, error.message)
  end

  def test_no_line_raises
    assert_raises(FullStoryPodfileCheck::TrunkError) { check(:none) }
  end

  def test_env_var_turns_trunk_error_into_warning
    warnings = check(:trunk, env: { 'FS_ALLOW_TRUNK' => '1' })
    assert_equal 1, warnings.length
    assert_match(/trunk message/, warnings.first)
    assert_match(/FS_ALLOW_TRUNK=1/, warnings.first)
  end

  def test_env_var_also_covers_no_line
    assert_equal 1, check(:none, env: { 'FS_ALLOW_TRUNK' => '1' }).length
  end

  def test_env_var_must_be_exactly_one
    %w[0 true yes].each do |value|
      assert_raises(FullStoryPodfileCheck::TrunkError) { check(:trunk, env: { 'FS_ALLOW_TRUNK' => value }) }
    end
  end

  def test_unknown_source_warns_and_does_not_raise
    warnings = check(:unknown, statement: 'Errno::EACCES: Permission denied')
    assert_equal 1, warnings.length
    assert_match(/Couldn't check your Podfile \(Errno::EACCES: Permission denied\)/, warnings.first)
    assert_match(/#{Regexp.escape(FullStoryPodfileCheck::SETUP_URL)}/, warnings.first)
  end

  def test_unknown_source_warns_even_with_env_var
    assert_equal 1, check(:unknown, env: { 'FS_ALLOW_TRUNK' => '1' }, statement: 'x').length
  end
end
