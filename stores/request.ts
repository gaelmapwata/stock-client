import { defineStore } from 'pinia'
import { useSnackbarStore } from '@/stores/snackbar'
// import { HttpPaginationResponseI } from '~/types/http'
import { RequestI } from '../types/request'

// eslint-disable-next-line import/prefer-default-export
export const useRequestStore = defineStore('request', {
  state: () => ({}),
  actions: {
    storeRequest (request: RequestI) {
      return new Promise((resolve) => {
        useFetchApi('/requests', {
          method: 'post',
          body: request
        }).then(({ status, data }) => {
          if (status.value === 'success') {
            const snackbarStore = useSnackbarStore()
            const { showSuccessSnackbar } = snackbarStore
            showSuccessSnackbar('Demande ajouté avec succès')

            resolve(data.value)
          }
        })
      })
    },
    // eslint-disable-next-line max-len
    fetchRequestsWithPagination ({ page, limit, filter }: { page: number, limit: number, filter?:{[key:string]:string | number | boolean} }): Promise<{data:RequestI[], total:number}> {
      return new Promise((resolve) => {
        useFetchApi('/requests', {
          method: 'get',
          params: {
            page,
            limit,
            ...(filter || {})
          }
        }).then(({ data }) => {
          if (data.value) {
            resolve(data.value)
          }
        })
      })
    },

    fetchRequestsToValidate (
      { page, limit, filter }: {
        page: number,
        limit: number,
        filter?: { [key: string]: string | number | boolean }
      }
    ): Promise<{ data: RequestI[], total: number }> {
      return new Promise((resolve) => {
        useFetchApi('/requests/to-validate', {
          method: 'get',
          params: {
            page,
            limit,
            ...(filter || {})
          }
        }).then(({ data }) => {
          if (data.value) {
            resolve(data.value)
          }
        })
      })
    },

    validateRequest (requestId: number): Promise<RequestI> {
      return new Promise((resolve, reject) => {
        useFetchApi(`/requests/${requestId}/validate`, {
          method: 'put'
        }).then(({ data }) => {
          if (data.value) {
            const snackbarStore = useSnackbarStore()
            const { showSuccessSnackbar } = snackbarStore
            showSuccessSnackbar('Demande validé avec succès')

            resolve(data.value)
          } else {
            reject()
          }
        })
      })
    },
    cancelRequest (requestId: number): Promise<RequestI> {
      return new Promise((resolve, reject) => {
        useFetchApi(`/requests/${requestId}/cancel`, {
          method: 'put'
        }).then(({ data }) => {
          if (data.value) {
            const snackbarStore = useSnackbarStore()
            const { showSuccessSnackbar } = snackbarStore
            showSuccessSnackbar('Demande annuler avec succès')

            resolve(data.value)
          } else {
            reject()
          }
        })
      })
    }
  }
})
