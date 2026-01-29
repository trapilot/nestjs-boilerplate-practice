export const ENV = {
  apiBaseURL: import.meta.env.VITE_API_BASE_URL as string,
  version: import.meta.env.VITE_APP_VERSION as string,
  tenantId: import.meta.env.VITE_APP_TENANT_ID as string,
  tinyMCE: import.meta.env.VITE_APP_TINYMCE_KEY as string,
}
