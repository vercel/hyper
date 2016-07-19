export function escapeShellArgument (text) {
	return text.replace(/([ \(\)\[\]<>\\\|'"`;!\?#\$&\*])/g, '\\$1');
}
