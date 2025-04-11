import type { IResourceItem } from "../../../contexts/resource/types";
export type Tree = {
    item: IResourceItem;
    children: {
        [key: string]: Tree;
    };
};
export type FlatTreeItem = IResourceItem & {
    key: string;
    children: FlatTreeItem[];
};
export declare const createTree: (resources: IResourceItem[], legacy?: boolean) => FlatTreeItem[];
//# sourceMappingURL=create-tree.d.ts.map