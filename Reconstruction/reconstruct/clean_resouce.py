# -*- coding: utf-8 -*-
import os
def clean(url):
    os.system("rm -rf " + url + "../reconstruct_this/*")
    os.system("rm -rf " + url + "../calibration_images/*")
    return True
