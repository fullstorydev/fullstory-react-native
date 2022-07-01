import fs from "fs/promises";
import path from "path";
import { addFullStoryToPodfile } from "../withFullStoryIos";
import { FULLSTORY_DEFAULT_VERSION } from "../constants";

describe("Config Plugin iOS Tests", function () {
  let podfile: string;

  beforeAll(async function () {
    podfile = await fs.readFile(path.resolve(__dirname, "./fixtures/Podfile"), {
      encoding: "utf-8",
    });
  });

  it("Adds FullStory to Podfile", async function () {
    let result = podfile;
    result = addFullStoryToPodfile(result, FULLSTORY_DEFAULT_VERSION);
    expect(result).toMatchSnapshot();
  });
});
