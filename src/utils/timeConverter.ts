export const convertToHHMMSS = (val: number) => {
    const secNum = parseInt(val.toString(), 10);
    let hours: string = (Math.floor(secNum / 3600)).toString();
    let minutes: string = (Math.floor((secNum - Number(hours) * 3600) / 60)).toString()
    let seconds: string = (secNum - Number(hours) * 3600 - Number(minutes) * 60).toString();

    if (Number(hours) < 10) {
        hours = '0' + hours;
    }
    if (Number(minutes) < 10) {
        minutes = '0' + minutes;
    }
    if (Number(seconds) < 10) {
        seconds = '0' + seconds;
    }
    let time;
    if (hours === '00') {
        time = minutes + ':' + seconds;
    } else {
        time = hours + ':' + minutes + ':' + seconds;
    }
    return time;
};
