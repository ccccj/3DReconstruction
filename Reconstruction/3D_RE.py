# -*- coding: utf-8 -*-
from reconstruct import stereoRectify
from reconstruct import disparity
from reconstruct import clean_resouce

url = '/Users/Amon/Desktop/_3D-reconstruction/Reconstruction/reconstruct/'

f = open(url + 'log.txt', 'w')
ret = stereoRectify.rectify(url)
if ret == True:
    f.write('stereoRectify success\n')

ret = disparity.dis(url)
if ret == True:
    f.write('disparity success\n')

ret = clean_resouce.clean(url)
if ret == True:
    f.write('clean success\n')

f.close()



#
