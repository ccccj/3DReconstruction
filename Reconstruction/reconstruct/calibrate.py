import cv2
import numpy as np
import glob
from tqdm import tqdm
import PIL.ExifTags
import PIL.Image
import json

#============================================
# 相机校准
#============================================
url = '/Users/Amon/Desktop/_3D-reconstruction/Reconstruction/'

# 定义棋盘目标的大小
chessboard_size = (7,5)

# 定义数组以保存检测到的点
obj_points = [] # 现实世界中的3D点
img_points = [] # 影像平面中的3D点

# 定义一个网格来存储所有点。存储的点需要是有序的，如：（0,0,0），（1,0,0），（2,0,0）….，（6,5,0）
# 准备要显示的网格和点 [35, 3] (np.prod：连乘)
objp = np.zeros((np.prod(chessboard_size),3),dtype=np.float32)
objp[:,:2] = np.mgrid[0:chessboard_size[0], 0:chessboard_size[1]].T.reshape(-1,2)

# 读取图像
# 使用glob迭代地打开图片
calibration_paths = glob.glob(url + 'calibration_images/*')

# 遍历图像以找到内在矩阵
# 用tqdm包裹循环，以了解距离处理上一个图像已经有多长时间了，还剩下多少图像没有处理

for image_path in tqdm(calibration_paths):
	# 载入图片
	image = cv2.imread(image_path)
    # 转换为灰度图
	gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
	print("图片已加载，正在分析...")
	# 找棋盘角（opencv的角点检测算法）
	ret, corners = cv2.findChessboardCorners(gray_image, chessboard_size, None)


    # 找到棋盘角 ret=True，否则为False
	if ret == True:
		print("检测到棋盘！")
		print(image_path)
		# 定义亚像素精度的标准
        # 30次迭代，精度为0.001
		criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 0.001)
		# 根据条件优化拐角位置（以达到亚像素精度）
        # 重新定位点 （接收图像、角点、搜索窗口大小、零区域、实际条件作为输入）
		cv2.cornerSubPix(gray_image, corners, (5,5), (-1,-1), criteria)
		obj_points.append(objp)
		img_points.append(corners)

gray_image = cv2.cvtColor(cv2.imread(url + 'calibration_images/0.jpeg'), cv2.COLOR_BGR2GRAY)
# 校准相机、输出相机参数
# 摄像机矩阵（k）、畸变系数（dist）、旋转和平移矢量（rvecs和tvecs）
ret, K, dist, rvecs, tvecs = cv2.calibrateCamera(obj_points, img_points, gray_image.shape[::-1], None, None)

# 将参数保存到numpy文件中
# np.save("camera_params/ret", ret)
# np.save("../Reconstruction/camera_params/K", K)
# print(K)
# np.save("../Reconstruction/camera_params/dist", dist)
# np.save("../Reconstruction/camera_params/rvecs", rvecs)
# np.save("../Reconstruction/camera_params/tvecs", tvecs)

# 获取exif数据以获取焦距
exif_img = PIL.Image.open(calibration_paths[0])

exif_data = {
	PIL.ExifTags.TAGS[k]:v
	for k, v in exif_img._getexif().items()
	if k in PIL.ExifTags.TAGS}

# 以元组形式获取焦距
focal_length_exif = exif_data['FocalLength']

# 获取小数形式的焦距
focal_length = focal_length_exif[0]/focal_length_exif[1]

# 保存焦距
# np.save("../Reconstruction/camera_params/FocalLength", focal_length)
# print('focal:' + str(focal_length))


#data = [ { 'focal' : focal_length, 'dist1' : dist[0][0], 'dist2' : dist[0][1], 'dist3' : dist[0][2], 'dist4' : dist[0][3], 'dist5' : dist[0][4], 'k00' : K[0][0], 'k01' : K[0][1], 'k02' : K[0][2], 'k10' : K[1][0], 'k11' : K[1][1], 'k12' : K[1][2], 'k20' : K[2][0], 'k21' : K[2][1], 'k22' : K[2][2]} ]

data = { 'focal' : focal_length, 'dist' : [dist[0][0], dist[0][1], dist[0][2], dist[0][3], dist[0][4]], 'K' : [K[0][0], K[0][1], K[0][2], K[1][0], K[1][1], K[1][2], K[2][0], K[2][1], K[2][2]]}
json_str = json.dumps(data)
new_dict = json.loads(json_str)
with open(url + "record.json", "w") as f:
    json.dump(new_dict, f)

'''
# 计算投影误差 错误应尽可能接近0
mean_error = 0
for i in range(len(obj_points)):
	# 通过给定的内外参数计算三维点投影到二维图像平面上的坐标
	img_points2, _ = cv2.projectPoints(obj_points[i],rvecs[i],tvecs[i], K, dist)
	error = cv2.norm(img_points[i], img_points2, cv2.NORM_L2) / len(img_points2)
	mean_error += error

total_error = mean_error / len(obj_points)
print(total_error)
'''




#
