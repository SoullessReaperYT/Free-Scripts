import { system } from "@minecraft/server"

export function wait(time) {
    return new Promise((resolve) => {
        const waitTimeout = system.runTimeout(() => {
            system.clearRun(waitTimeout);
            resolve();
        }, time);
    });
}

const formatTime = (milliseconds) => ({
    days: Math.floor(milliseconds / (1000 * 60 * 60 * 24)),
    hours: Math.floor((milliseconds / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((milliseconds / (1000 * 60)) % 60),
    seconds: Math.floor((milliseconds / 1000) % 60),
});


export const getTime = (timerInfo) => {
    const targetDate = new Date(timerInfo.targetDate);
    const timeRemaining = targetDate - new Date();
    return formatTime(timeRemaining);
};


export const setTimer = (value, unit) => {
    const targetDate = new Date();
    const units = { hours: 'Hours', days: 'Date', minutes: 'Minutes', seconds: 'Seconds' };
    targetDate[`set${units[unit]}`](targetDate[`get${units[unit]}`]() + value);
    return { value, unit, targetDate };
};

export function hasTimerReachedEnd(targetDate) {
    if (!(targetDate instanceof Date)) targetDate = new Date(targetDate);
    const currentDate = new Date();
    return currentDate > targetDate;
}