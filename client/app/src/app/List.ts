export interface List {
    id?: number;
    ["list-name"]: string;
    superhero_ids: Array<number>;
    description: string;
    visibility: boolean;
}