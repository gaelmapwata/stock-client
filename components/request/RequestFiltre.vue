import { Value } from 'sass';
<template>
  <div>
    <p class="text-center mb-2">
      Filter
    </p>

    <v-row justify="center">
      <v-col cols="12" sm="6" md="4">
        <v-select
          v-model="filter.articleId"
          :items="articles"
          item-title="label"
          item-value="id"
          label="Articles"
          variant="solo-filled"
          density="compact"
          hide-details
          flat
          rounded
          clearable
        />
      </v-col>

      <v-col cols="12" class="pa-0" />

      <v-col cols="12" sm="6" md="4" class="d-flex align-center">
        <CommonDateRangePicker v-model="filter.date" />
      </v-col>

      <v-col cols="12" class="text-center">
        <v-btn
          color="primary"
          elevation="0"
          width="150"
          rounded="xl"
          append-icon="mdi-tune-variant"
          class="mx-1 mb-2"
          @click="handleFilter()"
        >
          <span class="text-none">Search</span>
        </v-btn>

        <v-btn
          v-if="showResetButton"
          elevation="0"
          width="150"
          rounded="xl"
          class="mx-1 mb-2"
          variant="tonal"
          append-icon="mdi-refresh"
          @click="resetFilter()"
        >
          <span class="text-none">Reset</span>
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useArticleStore } from '~/stores/article'

const props = defineProps({
  modelValue: { type: Object, required: true },
  showResetButton: { type: Boolean, default: true }
})

const emit = defineEmits(['update:modelValue', 'filter'])

const articleStore = useArticleStore()

const { fetchArticles } = articleStore
const { articles } = storeToRefs(articleStore)

fetchArticles()

const filter = computed({
  get () {
    return props.modelValue
  },
  set (newValue) {
    emit('update:modelValue', newValue)
  }
})

function resetFilter () {
  filter.value = {}
  emit('filter', filter.value)
}

function handleFilter () {
  if (filter.value.date) {
    [filter.value.startDate, filter.value.endDate] = filter.value.date
    filter.value.endDate = filter.value.endDate ?? filter.value.startDate
  } else {
    delete filter.value.startDate
    delete filter.value.endDate
  }

  emit('filter', filter.value)
}
</script>
