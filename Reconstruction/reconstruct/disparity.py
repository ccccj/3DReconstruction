import cv2
import numpy as np
import glob
from tqdm import tqdm
import PIL.ExifTags
import PIL.Image
from matplotlib import pyplot as plt

#=====================================
# 函数声明
#=====================================

# 创建点云文件的功能
def create_output(vertices, colors, filename):
	colors = colors.reshape(-1,3)
	vertices = np.hstack([vertices.reshape(-1,3),colors])

	ply_header = '''ply
		format ascii 1.0
		element vertex %(vert_num)d
		property float x
		property float y
		property float z
		property uchar red
		property uchar green
		property uchar blue
		end_header
		'''
	with open(filename, 'w') as f:
		f.write(ply_header %dict(vert_num=len(vertices)))
		np.savetxt(f,vertices,'%f %f %f %d %d %d')

#=========================================================
# 立体3D重建
#=========================================================

def dis(url):
	# 加载相机参数

	K = np.load(url + '../camera_params/K.npy')
	dist = np.load(url + '../camera_params/dist.npy')
	focal_length = np.load(url + '../camera_params/FocalLength.npy')

	f = open(url + '../camera_params/focal.txt')
	focal_length = np.float32(float(f.read()))


	f = open(url + '../camera_params/K00.txt')
	K[0][0] = np.float32(float(f.read()))
	f = open(url + '../camera_params/K02.txt')
	K[0][2] = np.float32(f.read())
	f = open(url + '../camera_params/K11.txt')
	K[1][1] = np.float32(f.read())
	f = open(url + '../camera_params/K12.txt')
	K[1][2] = np.float32(f.read())
	f = open(url + '../camera_params/dist1.txt')
	dist[0][0] = np.float32(f.read())
	f = open(url + '../camera_params/dist2.txt')
	dist[0][1] = np.float32(f.read())
	f = open(url + '../camera_params/dist3.txt')
	dist[0][2] = np.float32(f.read())
	f = open(url + '../camera_params/dist4.txt')
	dist[0][3] = np.float32(f.read())
	f = open(url + '../camera_params/dist5.txt')
	dist[0][4] = np.float32(f.read())

	# 指定图像路径
	img_path1 = url + '../reconstruct_this/00.jpeg'
	img_path2 = url + '../reconstruct_this/11.jpeg'

	# 载入图片
	img_1 = cv2.imread(img_path1)
	img_2 = cv2.imread(img_path2)
	#img_1 = cv2.cvtColor(img_1, cv2.COLOR_BGR2GRAY) # 灰度图
	#img_2 = cv2.cvtColor(img_2, cv2.COLOR_BGR2GRAY) # 灰度图
	# 获取高度和宽度。注意：假设两张图片的尺寸相同。它们必须具有相同的大小和高度。
	h, w = img_2.shape[:2]

	# 获取最佳相机矩阵以获得更好的失真度
	# 基于自由缩放参数来优化相机矩阵
	# 如果缩放参数alpha = 0，则返回具有最少不需要像素的未失真图像。因此，它甚至可能会删除图像角落的一些像素。如果alpha = 1，则所有像素都保留有一些额外的黑色图像。此函数还返回可用于裁剪结果的图像ROI
	new_camera_matrix, roi = cv2.getOptimalNewCameraMatrix(K, dist, (w,h), 1, (w,h))

	print('1=================')
	#(rectification_l, rectification_r, projection_l,
	#    projection_r, disparityToDepthMap, ROI_l, ROI_r) = cv2.stereoRectify(K, dist, K, dist, img_1.shape, R, T, None, None, None, None, None, alpha=0)
	print('2=================')

	# 图像不失真
	img_1_downsampled = cv2.undistort(img_1, K, dist, None, new_camera_matrix)
	img_2_downsampled = cv2.undistort(img_2, K, dist, None, new_camera_matrix)

	# SGBM算法步骤
	# 1.预过滤图像，用于归一化亮度和增强纹理
	# 2.使用SAD窗口沿水平极线执行相应的搜索
	# 3.后过滤图像，以消除不良的相关匹配

	# 注意：视差范围根据通过反复试验获得的特定参数进行调整。
	win_size = 8 # 运行的窗口大小
	min_disp = -10
	max_disp = 118 #min_disp * 9
	num_disp = max_disp - min_disp # 需要被16整除

	# 创建块匹配对象。
	# texture_threshold：过滤出纹理不足以进行可靠匹配 - 区域斑点范围和大小：基于块的匹配器通常会在对象边界附近产生“斑点”，其中匹配窗口捕获一侧的前景和背景 在另一场景中，匹配器似乎还在桌子上投影的纹理中找到小的虚假匹配项。为了消除这些伪像，我们使用由speckle_size和speckle_range参数控制的散斑滤镜对视差图像进行后处理。
	# speckle_size将视差斑点排除为“斑点”的像素数。
	# speckle_range控制必须将值差异视为同一对象的一部分的程度。 - 视差数量：滑动窗口的像素数。它越大，可见深度的范围就越大，但是需要更多的计算。
	# min_disparity：从开始搜索的左像素的x位置开始的偏移量。
	# uniqueness_ratio：另一个后过滤步骤。如果最佳匹配视差不足够好于搜索范围中的所有其他视差，则将像素滤出。如果texture_threshold和斑点过滤仍在通过虚假匹配，则可以尝试进行调整。
	# prefilter_size和prefilter_cap：预过滤阶段，可标准化图像亮度并增强纹理，以准备块匹配。
	stereo = cv2.StereoSGBM_create(minDisparity = min_disp,
		numDisparities = num_disp,
		blockSize = 8,
		uniquenessRatio = 5,
		speckleWindowSize = 5,
		speckleRange = 5,
		disp12MaxDiff = 2,
		P1 = 8*3*win_size**2, # 8*3*win_size**2,
		P2 =32*3*win_size**2)  # 32*3*win_size**2)

	# 计算视差图
	print ("\n正在计算视差图...")
	disparity_map = stereo.compute(img_1_downsampled, img_2_downsampled)

	# 在生成3D云之前先显示视差图，以验证点云将可用
	#plt.imshow(disparity_map, 'gray')
	#plt.show()

	# 生成点云
	print ("\nGenerating the 3D map...")

	# 获取新的下采样宽度和高度
	h,w = img_2_downsampled.shape[:2]

	# 透视变换矩阵
	# 此转换矩阵来自openCV文档，似乎对我不起作用
	Q = np.float32([[1,0,0,-w/2.0],
					[0,-1,0,h/2.0],
					[0,0,0,-focal_length],
					[0,0,1,0]])

	# 该转换矩阵来自Didier Stricker教授关于计算机视觉的简报
	# Link : https://ags.cs.uni-kl.de/fileadmin/inf_ags/3dcv-ws14-15/3DCV_lec01_camera.pdf
	Q2 = np.float32([[1,0,0,0],
					[0,-1,0,0],
					[0,0,focal_length*0.05,0], # 通过实验获得的焦距倍增。
					[0,0,0,1]])

	# 将点重新投影到3D中
	points_3D = cv2.reprojectImageTo3D(disparity_map, Q2)
	# 获取色点
	colors = cv2.cvtColor(img_1_downsampled, cv2.COLOR_BGR2RGB)

	# 消除值为0的点（即无深度）
	mask_map = disparity_map > disparity_map.min()

	# 遮罩颜色和点
	output_points = points_3D[mask_map]
	output_colors = colors[mask_map]

	#np.save("/Users/Amon/Desktop/point", output_points)
	#np.save("/Users/Amon/Desktop/color", output_colors)

	# 定义输出文件的名称
	output_file = url + '../result/reconstructed.ply'

	# 生成点云
	print ("\n Creating the output file... \n")
	create_output(output_points, output_colors, output_file)
	return True

#
if __name__ == '__main__':
	dis('/Users/Amon/Desktop/_3D-reconstruction/Reconstruction/')
