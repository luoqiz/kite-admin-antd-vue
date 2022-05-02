<template>
  <div class="indexlayout-main-conent">
    <a-row :gutter="24" type="flex" >
      <a-col :xs="24" :sm="24" :md="24" :lg="18" :xl="18">
        <SysRoleListSearchTablePage :changeRoleId="changeRoleId"/>
      </a-col>
      <a-col :xs="24" :sm="24" :md="24" :lg="6" :xl="6">
        <SysRoleMenuRelationPage ref="detailsComponent" :roleId="v.currentRoleId"/>
      </a-col>
    </a-row>
  </div>
</template>
<script lang="ts">
import {defineComponent, reactive, ref} from "vue";
import SysRoleListSearchTablePage from "@/views/system/role/role/index.vue";
import SysRoleMenuRelationPage from "@/views/system/role/menu/index.vue";

export default defineComponent({
  name: 'SysRolesPage',
  components: {
    SysRoleListSearchTablePage,
    SysRoleMenuRelationPage,
  },
  setup() {
    const v = reactive({currentRoleId: "0"});
    const detailsComponent = ref();
    const changeRoleId = (roleId: string) => {
      v.currentRoleId = roleId;
    }
    return {
      SysRoleListSearchTablePage,
      SysRoleMenuRelationPage,
      changeRoleId,
      v,
      detailsComponent,
    }

  }

})
</script>