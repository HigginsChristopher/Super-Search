import { Review } from "./Review";

export interface User {
    id?: number,
    userType?: string,
    ["username"]?: string;
    ["password"]?: string;
    ["email"]?: string;
    ["verificationToken"]?: string;
    ["jwtToken"]?: string;
    ["verified"]?: boolean;
    ["reviews"]?: Review[];
    "disabled"?: boolean;
    showReviews?: boolean;
}