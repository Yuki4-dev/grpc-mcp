import * as fs from "fs";
import * as path from "path";

export const separator = path.sep;

type FromFileOrDirectoryOption = {
    extensions?: string[];
};

const toFileFullName = (dirent: fs.Dirent) => dirent.parentPath + separator + dirent.name;
export const getFileAsync = async (dir: string, option?: FromFileOrDirectoryOption) => {
    const file = await fs.promises.stat(dir);
    if (file.isDirectory()) {
        const files = await fs.promises.readdir(dir, { withFileTypes: true });
        return files.filter((f) => f.isFile() && applyOption(f, option)).map((f) => toFileFullName(f));
    } else {
        if (applyOption(dir, option)) {
            return [dir];
        } else {
            return [];
        }
    }
};

const applyOption = (file: fs.Dirent | string, option?: FromFileOrDirectoryOption): boolean => {
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
