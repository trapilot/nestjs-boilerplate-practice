import bytes from 'bytes'

export const FILE_CUSTOM_MAX_SIZE_METADATA = 'nest_file_module:file_custom_max_size'
export const FILE_CUSTOM_MAX_FILE_METADATA = 'nest_file_module:file_custom_max_file'
export const FILE_FIELD_NAME_METADATA = 'nest_file_module:file_field_name'

export const FILE_DEFAULT_MAX = 10
export const FILE_RATIO_MAX_ROUNDING = 0.025
export const FILE_SIZE_MAX_ROUNDING = 10

export const FILE_SIZE_IN_BYTES: number = bytes('3mb')
export const FILE_SIZE_IN_LARGE_BYTES: number = bytes('50mb')
