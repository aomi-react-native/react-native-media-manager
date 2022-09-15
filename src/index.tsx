import { NativeModules, Platform } from 'react-native';

const {
  AMRCTMediaManager: {
    SourceType,
    MediaType,
    CameraType,
    Quality,
    PhotoAlbumAuthorizationStatus,
    launchImageLibrary,
    launchCamera,
    getPhotoAlbumAuthorizationStatus,
  },
} = NativeModules;

export interface Options {
  /**
   * @see SourceType.photoLibrary
   * @see SourceType.savedPhotosAlbum
   * @see SourceType.camera
   */
  sourceType?: string;
  /**
   * 媒体类型
   * @see MediaType.image
   * @see MediaType.video
   */
  mediaType?: string;
  /**
   * 是否允许编辑
   */
  allowsEditing?: boolean;
  /**
   * 相机类型
   * @see CameraType.front 前置相机
   * @see CameraType.back 后置相机
   */
  cameraType?: string;
  /**
   * 质量
   * @see Quality.high
   * @see Quality.medium
   * @see Quality.low
   * @see Quality.VGA640x480
   * @see Quality.VGA1280x720
   * @see Quality.VGA960x540
   */
  quality?: number;
}

export enum PhotoAlbumAuthorizationStatusType {
  /**
   * 拒绝
   */
  denied,
  /**
   * 家长控制
   */
  restricted,
  /**
   * 用户未做出选择
   */
  notDetermined,
  /**
   * 已授权
   */
  authorized,
}

const DEFAULT_LIBRARY_OPTIONS = {
  sourceType: SourceType.savedPhotosAlbum,
  mediaType: MediaType.image,
  allowsEditing: false,
};

const DEFAULT_CAMERA_OPTIONS = {
  sourceType: SourceType.camera,
  mediaType: MediaType.image,
  cameraType: CameraType.back,
  allowsEditing: false,
  quality: Quality.high,
};

export interface PhotoAlbum {
  // 编辑后的图片
  edited?: {
    path?: string;
  };
  // 原图
  original?: {
    path?: string;
  };
}

/**
 * @author Sean(sean.snow@live.com)
 * @date 16/6/29
 */
class MediaManager {
  /**
   * 启动图库
   * @param options
   * @returns {*}
   */
  static launchLibrary(
    options: Options = DEFAULT_LIBRARY_OPTIONS,
  ): Promise<PhotoAlbum> {
    const newOptions = Object.assign({}, DEFAULT_LIBRARY_OPTIONS, options);
    return launchImageLibrary(newOptions);
  }

  /**
   * 启动相机
   * @param options
   */
  static launchCamera(options = DEFAULT_CAMERA_OPTIONS): Promise<PhotoAlbum> {
    const newOptions = Object.assign({}, DEFAULT_CAMERA_OPTIONS, options);
    if (Platform.OS === 'android' && newOptions.allowsEditing) {
      return new Promise((resolve, reject) => {
        launchCamera(newOptions)
          .then((image: any) => {
            setTimeout(() => {
              NativeModules.AMRCTMediaManager.launchEditing(
                image.original.path,
              )
                .then((edited: any) => {
                  resolve(Object.assign({}, image, edited));
                })
                .catch((err: any) => reject(err));
            }, 1);
          })
          .catch((err: any) => reject(err));
      });
    }
    return launchCamera(newOptions);
  }

  /**
   * 获取相册授权状态
   * ios
   */
  static getPhotoAlbumAuthorizationStatus(): Promise<PhotoAlbumAuthorizationStatusType> {
    return getPhotoAlbumAuthorizationStatus();
  }
}

export {
  MediaManager as default,
  SourceType,
  MediaType,
  CameraType,
  Quality,
  PhotoAlbumAuthorizationStatus,
};
