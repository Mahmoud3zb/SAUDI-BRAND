declare module "jsonwebtoken" {
    export interface SignOptions {
        expiresIn?: string | number | undefined;
        notBefore?: string | number | undefined;
        audience?: string | string[] | undefined;
        algorithm?: string | undefined;
        header?: any;
        encoding?: string | undefined;
        issuer?: string | undefined;
        subject?: string | undefined;
        jwtid?: string | undefined;
        noTimestamp?: boolean | undefined;
        keyid?: string | undefined;
        mutatePayload?: boolean | undefined;
        allowInsecureKeySizes?: boolean | undefined;
        allowInvalidAsymmetricKeyTypes?: boolean | undefined;
        [key: string]: any;
    }

    export function sign(
        payload: string | Buffer | object,
        secretOrPrivateKey: any,
        options?: SignOptions
    ): string;

    export function verify(
        token: string,
        secretOrPublicKey: any,
        options?: any
    ): any;

    export function decode(
        token: string,
        options?: any
    ): any;
}
