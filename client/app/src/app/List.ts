export interface List {
    user_id: number;
    list_id?: number;
    ["list-name"]: string;
    superhero_ids: Array<number>;
    description: string;
    visibility: boolean;
    rating?: any;
    modified?: any;
    username?: string;
}