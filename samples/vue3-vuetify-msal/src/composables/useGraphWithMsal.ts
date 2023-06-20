// samples/vue3-vuetify-msal/src/composables/useGraphWithMsal.ts

/* eslint-disable @typescript-eslint/no-explicit-any */

import { type Ref, ref } from 'vue'
import { ResponseType } from '@microsoft/microsoft-graph-client'
import { useMsal } from 'msal-vue'
import { useMsalAuthentication } from 'msal-vue'
import type { MsalAuthResult } from 'msal-vue'
import { getGraphClient } from '@/helpers/msGraph'
import type { PopupRequest, RedirectRequest, SilentRequest } from '@azure/msal-browser'

export type Graph = {
  get: (endpoint: string, tokenRequest?: PopupRequest | RedirectRequest | SilentRequest) => Promise<void>
  response: Ref<any | null>
  error: Ref<any | null>
  auth: MsalAuthResult
}

export function useGraphWithMsal(): Graph {
  const { account } = useMsal()
  const { acquireToken, result, error } = useMsalAuthentication()
  const response = ref<any | null>(null)
  const err = ref<any | null>(null)
  const auth: MsalAuthResult = {
    acquireToken: acquireToken,
    result: result,
    error: error,
  }

  const get = async (
    endpoint: string,
    tokenRequest?: PopupRequest | RedirectRequest | SilentRequest,
  ): Promise<void> => {
    console.log(`VueApp[useGraphWithMsal]:AuthResult: ${JSON.stringify(result.value)}`)
    if (result.value == null) {
      await acquireToken(tokenRequest)
    } else if (result.value != null && result.value.account?.homeAccountId !== account.value?.homeAccountId) {
      await acquireToken(tokenRequest)
    } else if (result.value != null && result.value.accessToken == '') {
      await acquireToken(tokenRequest)
    }

    const accessToken = result.value != null ? result.value.accessToken : null
    try {
      await getGraphClient(accessToken)
        .api(endpoint)
        .responseType(ResponseType.RAW)
        .get()
        .then((graphResponse: Response) => {
          if (graphResponse.status === 200) {
            graphResponse.json().then((json: any) => {
              response.value = json
              console.log(`VueApp[useGraphWithMsal]:get() 200 Response: ${JSON.stringify(response.value)}`)
            })
          } else {
            graphResponse.json().then((json: any) => {
              err.value = json
              console.log(`VueApp[useGraphWithMsal]:get() Non-200 Response: ${JSON.stringify(error.value)}`)
            })
          }
        })
    } catch (e) {
      err.value = e
      console.log(`VueApp[useGraphWithMsal]:get() error: ${JSON.stringify(error.value)}`)
    }
  }

  return {
    get: get,
    response: response,
    error: error,
    auth: auth,
  }
}
