require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "fullstory_react-native"
  s.version      = package["version"]
  s.summary      = "summary"
  s.description  = <<-DESC
                   @fullstory/react-native
                   DESC
  s.homepage     = "https://github.com/github_account/fullstory_react-native"
  s.license      = "MIT"
  # s.license    = { :type => "MIT", :file => "FILE_LICENSE" }
  s.authors      = { "Your Name" => "yourname@email.com" }
  s.platforms    = { :ios => "9.0" }
  s.source       = { :git => "https://github.com/github_account/fullstory_react-native.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,swift}"
  s.requires_arc = true

  s.dependency "React"
  s.dependency "FullStory"
  # ...
  # s.dependency "..."
end

