export class Logger {
    static log(message: string, ...rest: any[]) {
        const time = getBrazilTime();
        console.log(`[${time}] ${message}`, ...rest);
    }

    static warn(message: string, ...rest: any[]) {
        const time = getBrazilTime();
        console.warn(`[${time}] ${message}`, ...rest);
    }

    static error(message: string, ...rest: any[]) {
        const time = getBrazilTime();
        console.error(`[${time}] ${message}`, ...rest);
    }
}

export const customLogger = (message: string, ...rest: string[]) => {
    const time = getBrazilTime();

    if (message.startsWith('<--')) {
        const [_, method, path] = message.split(' ');
        console.log(`[${time}] REQUEST  method=${method} path=${path}`);
    } else if (message.startsWith('-->')) {
        const [_, method, path, status, ms] = message.split(' ');
        console.log(`[${time}] RESPONSE method=${method} path=${path} status=${status} duration=${ms}`);
    } else {
        console.log(`[${time}] ${message}`, ...rest);
    }
};

const getBrazilTime = () => {
    const now = new Date();
    const brazilTime = new Intl.DateTimeFormat('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).format(now);

    return brazilTime.replace(/(\d{2})\/(\d{2})\/(\d{4}), (\d{2}:\d{2}:\d{2})/, '$3-$2-$1 $4');
};
