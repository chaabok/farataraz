export interface SidebarStructureNode {
    id?: string;
    title: string;
    leaf?: boolean;
    items?: SidebarStructureNode[];
    subItems?: SidebarStructureNode[];
    [key: string]: any;
}
export declare const SIDEBAR_STRUCTURE: SidebarStructureNode[];
