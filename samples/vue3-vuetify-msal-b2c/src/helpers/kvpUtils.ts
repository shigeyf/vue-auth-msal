// samples/vue3-vuetify-msal/src/helpers/kvpUtils.ts

/* eslint-disable @typescript-eslint/no-explicit-any */

/** KvpData */
export type KvpData = {
  key: string
  value: string
}

/** KvpDataList  */
export type KvpDataList = KvpData[]

/**
 * convertToKvpDataList()
 * @param obj
 * @returns
 */
export function convertToKvpDataList(obj: any): KvpDataList {
  const kvpDataList: KvpDataList = []
  Object.keys(obj).map((key) => {
    const value = obj[key]
    switch (typeof value) {
      case 'string':
        kvpDataList.push({ key: key, value: obj[key] })
        break
      case 'object':
        switch (value) {
          case null:
            kvpDataList.push({ key: key, value: '(null)' })
            break
          default:
            kvpDataList.push({ key: key, value: JSON.stringify(value) })
        }
        break
      case 'number':
        {
          const num = value as number
          kvpDataList.push({ key: key, value: num.toString() })
        }
        break
      case 'boolean':
        kvpDataList.push({ key: key, value: value ? 'true' : 'false' })
        break
      case 'function':
        kvpDataList.push({ key: key, value: '[function]' })
        break
      case undefined:
        kvpDataList.push({ key: key, value: '[undefined]' })
        break
      default:
        break
    }
  })
  return kvpDataList
}
