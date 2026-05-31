#!/usr/bin/env bash
set -euo pipefail

MERGED_SPEC="./merged.yaml"
TMP_DIR="./.openapi-tmp"
BACKEND_OPENAPI_SPEC="${BACKEND_OPENAPI_SPEC:-../text-reach-backend/target/openapi/text-reach-openapi.json}"

TENANT_API_DOCS_URL="${TENANT_API_DOCS_URL:-http://localhost:8000/tenant/internal/api-docs.yaml}"
AUTH_API_DOCS_URL="${AUTH_API_DOCS_URL:-http://localhost:8014/auth/internal/api-docs.yaml}"
CONTACT_API_DOCS_URL="${CONTACT_API_DOCS_URL:-http://localhost:8001/contact/internal/api-docs.yaml}"
PHONE_API_DOCS_URL="${PHONE_API_DOCS_URL:-http://localhost:8008/phone/internal/api-docs.yaml}"
CAMPAIGN_API_DOCS_URL="${CAMPAIGN_API_DOCS_URL:-http://localhost:8012/campaign/internal/api-docs.yaml}"

mkdir -p "${TMP_DIR}"

cleanup() {
	rm -f "${MERGED_SPEC}"
	rm -rf "${TMP_DIR}"
}
trap cleanup EXIT

if [[ -f "${BACKEND_OPENAPI_SPEC}" ]]; then
	echo "Using backend OpenAPI spec from ${BACKEND_OPENAPI_SPEC}"
	cp "${BACKEND_OPENAPI_SPEC}" "${MERGED_SPEC}"
	bunx orval --config ./orval.config.ts --project backend
	echo "Generated Orval client in ./src/lib/api"
	exit 0
fi

if ! command -v yq >/dev/null 2>&1; then
	echo "Error: yq is required. Install it and re-run this script."
	exit 1
fi

download_spec() {
	local name="$1"
	local url="$2"
	local destination="$3"

	echo "Downloading ${name} spec from ${url}"
	curl -fsSL "${url}" -o "${destination}"
}

download_spec "tenant" "${TENANT_API_DOCS_URL}" "${TMP_DIR}/tenant.yaml"
download_spec "auth" "${AUTH_API_DOCS_URL}" "${TMP_DIR}/auth.yaml"
download_spec "contact" "${CONTACT_API_DOCS_URL}" "${TMP_DIR}/contact.yaml"
download_spec "phone" "${PHONE_API_DOCS_URL}" "${TMP_DIR}/phone.yaml"
download_spec "campaign" "${CAMPAIGN_API_DOCS_URL}" "${TMP_DIR}/campaign.yaml"

yq eval-all 'select(fileIndex == 0) * select(fileIndex == 1) * select(fileIndex == 2) * select(fileIndex == 3) * select(fileIndex == 4)' \
	"${TMP_DIR}/tenant.yaml" \
	"${TMP_DIR}/auth.yaml" \
	"${TMP_DIR}/contact.yaml" \
	"${TMP_DIR}/phone.yaml" \
	"${TMP_DIR}/campaign.yaml" \
	> "${MERGED_SPEC}"

bunx orval --config ./orval.config.ts --project backend

echo "Generated Orval client in ./src/lib/api"
