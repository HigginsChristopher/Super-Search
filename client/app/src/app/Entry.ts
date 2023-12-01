export interface Entry {
    ["claim_id"]?: number;
    ["date_recieved"]: Date;
    ["date_notice_sent"]: Date;
    ["date_dispute_recieved"]: Date;
    ["notes"]: string;
    ["status"]: string;
    ["reviews"]: number[];

}