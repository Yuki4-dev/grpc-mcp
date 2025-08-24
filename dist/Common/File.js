import * as fs from "fs";
import * as path from "path";
export const separator = path.sep;
const toFileFullName = (dirent) => dirent.parentPath + separator + dirent.name;
export const getFileAsync = async (dir, option) => {
    const file = await fs.promises.stat(dir);
    if (file.isDirectory()) {
        const files = await fs.promises.readdir(dir, { withFileTypes: true });
        return files.filter((f) => f.isFile() && applyOption(f, option)).map((f) => toFileFullName(f));
    }
    else {
        if (applyOption(dir, option)) {
            return [dir];
        }
        else {
            return [];
        }
    }
};
const applyOption = (file, option) => {
    if (typeof file === "string") {
        if (option?.extensions && option.extensions.some((ext) => !file.toLowerCase().endsWith(ext))) {
            return false;
        }
        return true;
    }
    if (option?.extensions && option.extensions.some((ext) => !file.name.toLowerCase().endsWith(ext))) {
        return false;
    }
    return true;
};
