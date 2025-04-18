function loadScript(url) {
	// Window
	if (typeof window === 'object') {
		var script = document.createElement('script');
		script.type = "text/javascript";
		script.src = url;
		document.head.appendChild(script);
	// Web Worker
	} else if (typeof importScripts === 'function') {
		importScripts(url);
	}
}

function currentScriptPath() {
	// NOTE: document.currentScript does not work in a Web Worker
	// So we have to parse a stack trace maually
	try {
		throw new Error('');
	} catch(e) {
		var stack = e.stack;
		var line = null;

		// Chrome and IE
		if (stack.indexOf('@') !== -1) {
			line = stack.split('@')[1].split('\n')[0];
		// Firefox
		} else {
			line = stack.split('(')[1].split(')')[0];
		}
		line = line.substring(0, line.lastIndexOf('/')) + '/';
		return line;
	}
}

// This is used by libunrar.js to load libunrar.js.mem
var unrarMemoryFileLocation = null;

(function() {

var _loaded_archive_formats = [];

// Polyfill for missing array slice method (IE 11)
if (typeof Uint8Array !== 'undefined') {
if (! Uint8Array.prototype.slice) {
	Uint8Array.prototype.slice = function(start, end) {
		var retval = new Uint8Array(end - start);
		var j = 0;
		for (var i=start; i<end; ++i) {
			retval[j] = this[i];
			j++;
		}
		return retval;
	};
}
}

// FIXME: This function is super inefficient
function saneJoin(array, separator) {
	var retval = '';
	for (var i=0; i<array.length; ++i) {
		if (i === 0) {
			retval += array[i];
		} else {
			retval += separator + array[i];
		}
	}
	return retval;
}

function saneMap(array, cb) {
	var retval = new Array(array.length);
	for (var i=0; i<retval.length; ++i) {
		retval[i] = cb(array[i]);
	}
	return retval;
}

function loadArchiveFormats(formats) {
	// Get the path of the current script
	var path = currentScriptPath();

	// Load the formats
	formats.forEach(function(archive_format) {
		// Skip this format if it is already loaded
		if (_loaded_archive_formats.indexOf(archive_format) !== -1) {
			return;
		}

		// Load the archive format
		switch (archive_format) {
			case 'rar':
				unrarMemoryFileLocation = path + 'libunrar.js.mem';
				loadScript(path + 'libunrar.js');
				_loaded_archive_formats.push(archive_format);
				break;
			case 'zip':
				loadScript(path + 'jszip.js');
				_loaded_archive_formats.push(archive_format);
				break;
			case 'tar':
				loadScript(path + 'libuntar.js');
				_loaded_archive_formats.push(archive_format);
				break;
			default:
				throw new Error("Unknown archive format '" + archive_format + "'.");
		}
	});
}

function archiveOpenFile(file, cb) {
	// Get the file's info
	var blob = file.slice();
	var file_name = file.name;

	// Convert the blob into an array buffer
	var reader = new FileReader();
	reader.onload = function(evt) {
		var array_buffer = reader.result;

		// Open the file as an archive
		try {
			var archive = archiveOpenArrayBuffer(file_name, array_buffer);
			cb(archive, null);
		} catch(e) {
			cb(null, e);
		}
	};
	reader.readAsArrayBuffer(blob);
}

function archiveOpenArrayBuffer(file_name, array_buffer) {
	// Get the archive type
	var archive_type = null;
	if (isRarFile(array_buffer)) {
		archive_type = 'rar';
	} else if(isZipFile(array_buffer)) {
		archive_type = 'zip';
	} else if(isTarFile(array_buffer)) {
		archive_type = 'tar';
	} else {
		throw new Error("The archive type is unknown");
	}

	// Make sure the archive format is loaded
	if (_loaded_archive_formats.indexOf(archive_type) === -1) {
		throw new Error("The archive format '" + archive_type + "' is not loaded.");
	}

	// Get the entries
	var handle = null;
	var entries = [];
	try {
		switch (archive_type) {
			case 'rar':
				handle = _rarOpen(file_name, array_buffer);
				entries = _rarGetEntries(handle);
				break;
			case 'zip':
				handle = _zipOpen(file_name, array_buffer);
				entries = _zipGetEntries(handle);
				break;
			case 'tar':
				handle = _tarOpen(file_name, array_buffer);
				entries = _tarGetEntries(handle);
				break;
		}
	} catch(e) {
		throw new Error("Failed to open '" + archive_type + "' archive.");
	}

	// Sort the entries by name
	entries.sort(function(a, b) {
		if(a.name < b.name) return -1;
		if(a.name > b.name) return 1;
		return 0;
	});

	// Return the archive object
	return {
		file_name: file_name,
		archive_type: archive_type,
		array_buffer: array_buffer,
		entries: entries,
		handle: handle
	};
}

function archiveClose(archive) {
	archive.file_name = null;
	archive.archive_type = null;
	archive.array_buffer = null;
	archive.entries = null;
	archive.handle = null;
}

function _rarOpen(file_name, array_buffer) {
	// Create an array of rar files
	var rar_files = [{
		name: file_name,
		size: array_buffer.byteLength,
		type: '',
		content: new Uint8Array(array_buffer)
	}];

	// Return rar handle
	return {
		file_name: file_name,
		array_buffer: array_buffer,
		password: null,
		rar_files: rar_files
	};
}

function _zipOpen(file_name, array_buffer) {
	var zip = new JSZip(array_buffer);

	// Return zip handle
	return {
		file_name: file_name,
		array_buffer: array_buffer,
		password: null,
		zip: zip
	};
}

function _tarOpen(file_name, array_buffer) {
	// Return tar handle
	return {
		file_name: file_name,
		array_buffer: array_buffer,
		password: null
	};
}

function _rarGetEntries(rar_handle) {
	// Get the entries
	var info = readRARFileNames(rar_handle.rar_files, rar_handle.password);
	var entries = [];
	Object.keys(info).forEach(function(i) {
		var name = info[i].name;
		var is_file = info[i].is_file;

		entries.push({
			name: name,
			is_file: info[i].is_file,
			size_compressed: info[i].size_compressed,
			size_uncompressed: info[i].size_uncompressed,
			readData: function(cb) {
				setTimeout(function() {
					if (is_file) {
						try {
							readRARContent(rar_handle.rar_files, rar_handle.password, name, cb);
						} catch (e) {
							cb(null, e);
						}
					} else {
						cb(null, null);
					}
				}, 0);
			}
		});
	});

	return entries;
}

function _zipGetEntries(zip_handle) {
	var zip = zip_handle.zip;

	// Get all the entries
	var entries = [];
	Object.keys(zip.files).forEach(function(i) {
		var zip_entry = zip.files[i];
		var name = zip_entry.name;
		var is_file = ! zip_entry.dir;
		var size_compressed = zip_entry._data ? zip_entry._data.compressedSize : 0;
		var size_uncompressed = zip_entry._data ? zip_entry._data.uncompressedSize : 0;

		entries.push({
			name: name,
			is_file: is_file,
			size_compressed: size_compressed,
			size_uncompressed: size_uncompressed,
			readData: function(cb) {
				setTimeout(function() {
					if (is_file) {
						var data = zip_entry.asArrayBuffer();
						cb(data, null);
					} else {
						cb(null, null);
					}
				}, 0);
			}
		});
	});

	return entries;
}

function _tarGetEntries(tar_handle) {
	var tar_entries = tarGetEntries(tar_handle.file_name, tar_handle.array_buffer);

	// Get all the entries
	var entries = [];
	tar_entries.forEach(function(entry) {
		var name = entry.name;
		var is_file = entry.is_file;
		var size = entry.size;

		entries.push({
			name: name,
			is_file: is_file,
			size_compressed: size,
			size_uncompressed: size,
			readData: function(cb) {
				setTimeout(function() {
					if (is_file) {
						var data = tarGetEntryData(entry, tar_handle.array_buffer);
						cb(data.buffer, null);
					} else {
						cb(null, null);
					}
				}, 0);
			}
		});
	});

	return entries;
}

function isRarFile(array_buffer) {
	// The three styles of RAR headers
	var rar_header1 = saneJoin([0x52, 0x45, 0x7E, 0x5E], ', '); // old
	var rar_header2 = saneJoin([0x52, 0x61, 0x72, 0x21, 0x1A, 0x07, 0x00], ', '); // 1.5 to 4.0
	var rar_header3 = saneJoin([0x52, 0x61, 0x72, 0x21, 0x1A, 0x07, 0x01, 0x00], ', '); // 5.0

	// Just return false if the file is smaller than the header
	if (array_buffer.byteLength < 8) {
		return false;
	}

	// Return true if the header matches one of the RAR headers
	var header1 = saneJoin(new Uint8Array(array_buffer).slice(0, 4), ', ');
	var header2 = saneJoin(new Uint8Array(array_buffer).slice(0, 7), ', ');
	var header3 = saneJoin(new Uint8Array(array_buffer).slice(0, 8), ', ');
	return (header1 === rar_header1 || header2 === rar_header2 || header3 === rar_header3);
}

function isZipFile(array_buffer) {
	// The ZIP header
	var zip_header = saneJoin([0x50, 0x4b, 0x03, 0x04], ', ');

	// Just return false if the file is smaller than the header
	if (array_buffer.byteLength < 4) {
		return false;
	}

	// Return true if the header matches the ZIP header
	var header = saneJoin(new Uint8Array(array_buffer).slice(0, 4), ', ');
	return (header === zip_header);
}

function isTarFile(array_buffer) {
	// The TAR header
	var tar_header = saneJoin(['u', 's', 't', 'a', 'r'], ', ');

	// Just return false if the file is smaller than the header size
	if (array_buffer.byteLength < 512) {
		return false;
	}

	// Return true if the header matches the TAR header
	var header = saneJoin(saneMap(new Uint8Array(array_buffer).slice(257, 257 + 5), String.fromCharCode), ', ');
	return (header === tar_header);
}

// Figure out if we are running in a Window or Web Worker
var scope = null;
if (typeof window === 'object') {
	scope = window;
} else if (typeof importScripts === 'function') {
	scope = self;
}

// Set exports
scope.loadArchiveFormats = loadArchiveFormats;
scope.archiveOpenFile = archiveOpenFile;
scope.archiveOpenArrayBuffer = archiveOpenArrayBuffer;
scope.archiveClose = archiveClose;
scope.isRarFile = isRarFile;
scope.isZipFile = isZipFile;
scope.isTarFile = isTarFile;
scope.saneJoin = saneJoin;
scope.saneMap = saneMap;
})();
