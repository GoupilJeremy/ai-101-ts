export class AI101Error extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly isTransient: boolean = false,
        public readonly data: Record<string, string> = {}
    ) {
        super(message);
        this.name = 'AI101Error';
    }
}
