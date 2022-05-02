<template>
  <slot :items="items"></slot>
</template>
<script lang="ts">
import {computed, defineComponent, onMounted, ref} from "vue";
import {FetchItems, OptionDataType} from '@/store/dict';

export default defineComponent({
  name: 'ApesDict',
  props: {
    dictKey: {
      type: String,
      required: true
    },
    modelValue: {
      type: String,
      default: ''
    },
    itemFullValue: {
      type: String,
      default: ''
    },
  },
  setup(props, {emit}) {
    console.log("ApesDict 收到参数", props);

    // 数据值
    const editorData = computed({
      get: () => props.modelValue,
      set: val => {
        emit('update:modelValue', val);
      }
    });

    const items = ref<OptionDataType[]>([]);
    // 列表项
    const fecthItems = async () => {
      items.value = await FetchItems(props.dictKey)
    };

    onMounted(async () => {
      await fecthItems();
      if (props.itemFullValue != "") {
        items.value.splice(0, 0, {
          value: '',
          label: props.itemFullValue,
        });
      }
      console.log("items----", items);
    });

    return {
      items,
      editorData
    }
  }
})
</script>