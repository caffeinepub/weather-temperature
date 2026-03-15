import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type AccountName = string;
export interface Weather {
    lat: number;
    lon: number;
    timezone: string;
    tempMax: number;
    tempMin: number;
    cityName: string;
    windSpeed: number;
    currentTemp: number;
    humidity: bigint;
    feelsLike: number;
    weatherCode: bigint;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type AppError = {
    __kind__: "other";
    other: string;
} | {
    __kind__: "invalidSession";
    invalidSession: null;
} | {
    __kind__: "userAlreadyExists";
    userAlreadyExists: null;
} | {
    __kind__: "notAuthenticated";
    notAuthenticated: null;
} | {
    __kind__: "weakPassword";
    weakPassword: null;
} | {
    __kind__: "invalidCredentials";
    invalidCredentials: null;
} | {
    __kind__: "invalidAccountName";
    invalidAccountName: null;
};
export type Nickname = string;
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createAccount(accountName: AccountName, nickname: Nickname, password: string): Promise<AppError | null>;
    getActorId(sessionToken: string): Promise<AppError | null>;
    getAllUsers(): Promise<{
        accountCount: bigint;
        sessionCount: bigint;
        userCount: bigint;
    }>;
    getCallerUserRole(): Promise<UserRole>;
    getCurrentAccount(sessionToken: string): Promise<AppError | null>;
    getWeather(_actorId: Principal, _sessionToken: string, cityName: string): Promise<Weather>;
    isCallerAdmin(): Promise<boolean>;
    isLoggedIn(sessionToken: string): Promise<boolean>;
    loginWithAccountName(accountName: AccountName, password: string): Promise<AppError | null>;
    logout(sessionToken: string): Promise<AppError | null>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateNickname(newNickname: Nickname, sessionToken: string): Promise<AppError | null>;
    verifyCredentials(accountName: AccountName, password: string): Promise<AppError | null>;
}
