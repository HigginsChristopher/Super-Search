export interface User {
    ["username"]: string;
    ["password"]: string;
    ["email"]: string;
    ["verificationToken"]?: string;
    ["jwtToken"]?: string;
    ["activated"]: boolean;
}