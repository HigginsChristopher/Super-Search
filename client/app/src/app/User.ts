import { Review } from "./Review";

export interface User {
    ["user_id"]?: number,
    userType?: string,
    ["username"]?: string;
    ["password"]: string;
    ["email"]: string;
    ["verificationToken"]?: string;
    ["jwtToken"]?: string;
    ["verified"]?: boolean;
    ["reviews"]?: Review[];
    "disabled"?: boolean;
    showReviews?: boolean;
}