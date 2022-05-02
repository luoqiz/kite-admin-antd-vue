<template>
  <div class="clearfix">
    <a-upload
        list-type="picture-card"
        v-model:file-list="fileList"
        :customRequest="customRequest"
        :beforeUpload="beforeUpload"
        @preview="handlePreview"
        @change="handleChange"
    >
      <div v-if="fileList.length < size">
        <plus-outlined/>
        <div class="ant-upload-text">Upload</div>
      </div>
    </a-upload>
    <a-modal :visible="previewVisible" :footer="null" @cancel="handleCancel">
      <img alt="example" style="width: 100%" :src="previewImage"/>
    </a-modal>
  </div>
</template>
<script lang="ts">
import {PlusOutlined} from '@ant-design/icons-vue';
import {defineComponent, ref,} from 'vue';
import {message} from "ant-design-vue";
import request from '@/utils/request';

function getBase64(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

interface FileItem {
  uid: string;
  name?: string;
  status?: string;
  response?: string;
  percent?: number;
  url?: string;
  type?: string;
  size: number;
  preview?: string;
  originFileObj?: any;
  file?: string | Blob;
  thumbUrl?: any;
  xhr?: any;
}

interface FileInfo {
  file: FileItem;
  fileList: FileItem[];
}

export default defineComponent({
  name: 'ImageUpload',
  props: {
    modelValue: {
      required: true,
      type: String
    },
    size: {
      type: Number,
      default: 1
    },
  },
  components: {
    PlusOutlined,
  },
  setup(props, {emit}) {
    const fileListStr = !props.modelValue ? '[]' : props.modelValue;
    // 数据值
    const fileList = ref<FileItem[]>(JSON.parse(fileListStr) as FileItem[]);
    const previewVisible = ref<boolean>(false);
    const previewImage = ref<string | undefined>('');

    // 定义返回的数据
    type resDataType = Omit<FileItem, 'originFileObj' | 'xhr' | 'thumbUrl' | 'response' | 'percent' | 'preview'>
    let resData: resDataType[] = [];

    const handleCancel = () => {
      previewVisible.value = false;
    };
    const handlePreview = async (file: FileItem) => {
      if (!file.url && !file.preview) {
        file.preview = (await getBase64(file.originFileObj)) as string;
      }
      previewImage.value = file.url || file.preview;
      previewVisible.value = true;
    };
    const handleChange = ({file, fileList: newFileList}: FileInfo) => {
      if (file.status !== 'uploading') {
        console.log(file, fileList);
      }
      if (file.status === 'done') {
        console.log("newFileList", newFileList);
        console.log("file", file);

        fileList.value = newFileList;
        resData = [];
        for (const item of newFileList) {
          resData.push({
            uid: item.uid,
            name: item.name,
            status: item.status,
            url: item.url || item.originFileObj.url,
            type: item.type,
            size: item.size,
          })
        }
        emit('update:modelValue', JSON.stringify(resData));
      } else if (file.status === 'error') {
        message.error(`${file.name} file upload failed.`);
      }
    };

    const beforeUpload = (file: FileItem) => {
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
      if (!isJpgOrPng) {
        message.error('You can only upload JPG file!');
      }
      const isLt10M = file.size / 1024 / 1024 < 20;
      if (!isLt10M) {
        message.error('Image must smaller than 20MB!');
      }
      return isJpgOrPng && isLt10M;
    };

    const customRequest = async (options: any) => {
//       action: ""
//       data: {}
//       file: File {uid: "vc-upload-1616995353255-2", status: "done", url: "http://singles-club.oss-cn-hongkong.aliyuncs.com/res/image/微信图片_20210329110317.jpg", name: "微信图片_20210329110317.jpg", lastModified: 1616986999591, …}
//        filename: "file"
//        headers: {}
//        method: "post"
//        onError: ƒ onError(err, ret)
//        onProgress: ƒ onProgress(e)
//        onSuccess: ƒ onSuccess(ret, xhr)
//        withCredentials: false
      const file = options.file
      console.log("上传图片");

      // 请求阿里云上传权限
      const res = await request({
        headers: {'Content-Type': 'application/json; charset=utf-8'},
        url: '/storage/aliyun/permission',
        method: 'GET',
        data: {"path": "img"},
        params: {path: "/single/res/image"}
      });

      const formData = new FormData();
      //如果是base64文件，那么直接把base64字符串转成blob对象进行上传就可以了

      formData.append('name', file.name);
      //注意formData里append添加的键的大小写
      //存储在oss的文件路径
      formData.append('Key', res.data.dir + '${filename}');
      //accessKeyId
      formData.append('OSSAccessKeyId', res.data.accessid);
      //policy
      formData.append('policy', res.data.policy);
      //签名
      formData.append('signature', res.data.signature);
      //成功后返回的操作码
      formData.append('success_action_status', "200");
      // 文件参数必须放到最后
      formData.append('file', file);
      file.url = res.data.host + "/" + res.data.dir + file.name;
      await request({
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        url: res.data.host,
        method: 'post',
        data: formData,
        withCredentials: false,
        onUploadProgress: ({total, loaded}) => {
          options.onProgress({percent: Math.round((loaded / total) * 100).toFixed(2)}, file);
        },
      });

      options.onSuccess(null, file);
    };


    return {
      previewVisible,
      previewImage,
      fileList,
      handleCancel,
      handlePreview,
      handleChange,
      beforeUpload,
      customRequest,

    };
  },
});
</script>
<style>
/* you can make up upload button and sample style by using stylesheets */
.ant-upload-select-picture-card i {
  font-size: 32px;
  color: #999;
}

.ant-upload-select-picture-card .ant-upload-text {
  margin-top: 8px;
  color: #666;
}
</style>
