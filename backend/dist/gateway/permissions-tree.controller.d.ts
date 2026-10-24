interface PermissionNode {
    id: string;
    title: string;
    hasChildren: boolean;
}
interface PermissionAction {
    id: string;
    title: string;
    leaf: boolean;
}
export declare class PermissionsTreeController {
    getTree(parentIdRaw?: string, descendants?: string): PermissionNode[] | PermissionAction[] | {
        ids: string[];
    };
}
export {};
