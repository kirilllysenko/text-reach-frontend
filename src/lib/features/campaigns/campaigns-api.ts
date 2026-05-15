import type {
  ErrorResponseDto,
  PageCampaignDto,
  PageRequestCampaignFilterDtoCampaignSortDto,
} from "$lib/api/index.schemas";

export interface CampaignPageResponse {
  data: PageCampaignDto | ErrorResponseDto;
  status: number;
}

export function getCampaignPageWithBody(
  request: PageRequestCampaignFilterDtoCampaignSortDto,
): Promise<CampaignPageResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/campaign/campaign");
    xhr.withCredentials = true;
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Accept", "application/json");

    xhr.onload = () => {
      const responseText = xhr.responseText;
      if (!responseText) {
        resolve({ data: {}, status: xhr.status });
        return;
      }

      try {
        const data = JSON.parse(responseText) as PageCampaignDto | ErrorResponseDto;
        const errorDescription =
          xhr.status === 400 && "errorDescription" in data && !data.errorDescription?.trim()
            ? "Campaign page returned 400. This endpoint currently expects a GET request with a JSON body, which browsers do not send reliably."
            : undefined;

        resolve({
          data: errorDescription ? { ...data, errorDescription } : data,
          status: xhr.status,
        });
      } catch {
        resolve({
          data: {
            errorCode: "INTERNAL_ERROR",
            errorDescription: "Campaign page returned an unexpected non-JSON response.",
          },
          status: 500,
        });
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error while loading campaigns."));
    };

    xhr.send(JSON.stringify(request));
  });
}
