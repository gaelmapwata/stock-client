import { defineStore } from 'pinia'
import { useSnackbarStore } from '@/stores/snackbar'
import { typeArticleI } from '../types/typearticle'

// eslint-disable-next-line import/prefer-default-export
export const useTypeArticleStore = defineStore('typeArticle', {
  state: () => ({
    typeArticles: [] as typeArticleI[],
    loading: false,
    cached: false
  }),
  actions: {
    fetchTypeArticles (force = false) {
      if (!this.loading && (!this.cached || force)) {
        this.loading = true

        useFetchApi('/type-articles', {
          method: 'get'
        }).then(({ data }) => {
          if (data.value) {
            this.typeArticles = data.value
            this.loading = false
            this.cached = true
          }
        })
      }
    },
    updateTypeArticle (payload: typeArticleI) {
      return new Promise((resolve) => {
        useFetchApi(`/type-articles/${payload.id}`, {
          method: 'put',
          body: payload
        }).then(({ data }) => {
          if (data.value) {
            const snackbarStore = useSnackbarStore()
            const { showSuccessSnackbar } = snackbarStore
            showSuccessSnackbar('TypeArticle modifié avec succès')

            resolve(data.value)
            this.fetchTypeArticles(true)
          }
        })
      })
    },
    storeTypeArticle (typeArticle: typeArticleI) {
      return new Promise((resolve) => {
        useFetchApi('/type-articles', {
          method: 'post',
          body: typeArticle
        }).then(({ data }) => {
          if (data.value) {
            const snackbarStore = useSnackbarStore()
            const { showSuccessSnackbar } = snackbarStore
            showSuccessSnackbar('TypeArticle ajouté avec succès')

            resolve(data.value)
            this.fetchTypeArticles(true)
          }
        })
      })
    },
    deleteTypeArticle (typeArticleId: number) {
      return new Promise((resolve) => {
        useFetchApi(`/type-articles/${typeArticleId}`, {
          method: 'delete'
        }).then(({ status }) => {
          if (status.value === 'success') {
            const snackbarStore = useSnackbarStore()
            const { showSuccessSnackbar } = snackbarStore
            showSuccessSnackbar('TypeArticle supprimé avec succès')

            resolve(null)
            this.fetchTypeArticles(true)
          }
        })
      })
    }
  }
})
