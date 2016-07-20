// Taken from https://github.com/kevva/executable and modified
export function isExecutable (fileStat) {
	if (process.platform === 'win32') {
		return true;
	}

	return Boolean((fileStat['mode'] & parseInt('0001', 8)) ||
		(fileStat['mode'] & parseInt('0010', 8)) && process.getgid && gid === process.getgid() ||
		(fileStat['mode'] & parseInt('0100', 8)) && process.getuid && uid === process.getuid());
};
