<template>
    <div class="indexlayout-main-conent">
        <a-row :gutter="24" type="flex">
            <a-col :xs="24" :sm="24" :md="24" :lg="10" :xl="10">
                <SysDictListSearchTablePage :changeDictId="changeDictId"/>
            </a-col>
            <a-col :xs="24" :sm="24" :md="24" :lg="14" :xl="14">
                <SysDictDetailListSearchTablePage ref="detailsComponent" :dictId="v.currentDictId"/>
            </a-col>
        </a-row>
    </div>
</template>
<script lang="ts">
    import { defineComponent, reactive, ref } from "vue";
    import SysDictListSearchTablePage from './category/index.vue';
    import SysDictDetailListSearchTablePage from './details/index.vue';

    export default defineComponent({
        name: 'SysDictPage',
        components: {
            SysDictListSearchTablePage,
            SysDictDetailListSearchTablePage,
        },
        setup() {
            const v  = reactive({currentDictId:"0"});
            const detailsComponent = ref();
            const changeDictId = (dictId: string)=>{
                v.currentDictId = dictId;
                // detailsComponent.value.getList(1);
            }
            return {
                SysDictListSearchTablePage,
                SysDictDetailListSearchTablePage,
                changeDictId,
                v,
                detailsComponent,
            }

        }

    })
</script>