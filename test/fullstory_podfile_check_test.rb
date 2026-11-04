# Tests for fullstory_podfile_check.rb. The same test file runs in
# fullstory_flutter (cowpaths/mn) and @fullstory/react-native, so both copies
# of the check stay in step.
#
# Run: ruby fullstory_podfile_check_test.rb
# Point it at a different copy with FULLSTORY_PODFILE_CHECK=path/to/file.rb.
require 'minitest/autorun'
require 'tmpdir'

# Both repos keep the check one folder above this test.
check_path = ENV['FULLSTORY_PODFILE_CHECK'] || File.expand_path('../fullstory_podfile_check.rb', __dir__)
abort "Couldn't find fullstory_podfile_check.rb" unless check_path
require check_path

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

  def test_version_line_followed_by_unrelated_http_pod
    podfile = "  pod 'FullStory', '1.76.0'\n  pod 'Other', :http => 'https://example.com/other.tar.gz'\n"
    assert_equal :trunk, source_of(podfile)
  end

  # FullStory comes from somewhere other than trunk.

  def test_http_one_line
    assert_equal :url, source_of("  pod 'FullStory', :http => '#{URL}'\n")
  end

  def test_http_url_on_next_line
    # Our RN66 and Capacitor apps write it this way.
    assert_equal :url, source_of("  pod 'FullStory', :http =>\n  '#{URL}'\n")
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
    'two spaces' => '  ',
    'four spaces' => '    ',
    'nested target' => '      ',
    'tab' => "\t",
    'two tabs' => "\t\t",
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

  def test_wrapped_version_only_stays_trunk
    podfile = "  pod 'FullStory',\n    '~> 1.76.0'\n"
    assert_equal :trunk, source_of(podfile)
  end

  def test_wrapped_version_then_options
    podfile = "  pod 'FullStory', '1.76.0',\n    :configurations => ['Release']\n"
    assert_equal :trunk, source_of(podfile)
  end

  def test_wrap_ends_before_next_pod
    # The http option belongs to the next pod, not to FullStory.
    podfile = "  pod 'FullStory', '1.76.0'\n  pod 'Other',\n    :http => 'https://example.com/other.tar.gz'\n"
    assert_equal :trunk, source_of(podfile)
  end

  # The statement and version that the podspecs print.

  def test_statement_joins_multiline_call
    _, statement = FullStoryPodfileCheck.source("  pod 'FullStory', :http =>\n  '#{URL}'\n")
    assert_equal "pod 'FullStory', :http => '#{URL}'", statement
  end

  def test_url_version
    _, statement = FullStoryPodfileCheck.source("  pod 'FullStory', :http => '#{URL}'\n")
    assert_equal '1.76.0', FullStoryPodfileCheck.url_version(statement)
  end

  def test_url_version_from_url_on_next_line
    # The Flutter podspec compares this version to its own pin.
    _, statement = FullStoryPodfileCheck.source("  pod 'FullStory', :http =>\n  'https://ios-releases.fullstory.com/fullstory-1.75.2-xcframework.tar.gz'\n")
    assert_equal '1.75.2', FullStoryPodfileCheck.url_version(statement)
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

  def test_read_missing_file
    assert_equal [:none, nil], FullStoryPodfileCheck.read('/no/such/Podfile')
  end

  def test_read_nil_path
    assert_equal [:none, nil], FullStoryPodfileCheck.read(nil)
  end

  def test_read_real_file
    Dir.mktmpdir do |dir|
      path = File.join(dir, 'Podfile')
      File.write(path, "  pod 'FullStory', :http => '#{URL}'\n")
      assert_equal :url, FullStoryPodfileCheck.read(path)[0]
    end
  end
end
