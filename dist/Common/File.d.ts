export declare const separator: "\\" | "/";
type FromFileOrDirectoryOption = {
    extensions?: string[];
};
export declare const getFileAsync: (dir: string, option?: FromFileOrDirectoryOption) => Promise<string[]>;
export {};
