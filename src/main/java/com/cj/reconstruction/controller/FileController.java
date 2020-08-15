package com.cj.reconstruction.controller;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.cj.reconstruction.error.BusinessException;
import com.cj.reconstruction.error.EmBusinessError;
import com.cj.reconstruction.response.CommonReturnType;
import com.cj.reconstruction.util.FileUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * @author Nightessss 2020/5/9 20:14
 */
@RestController
@RequestMapping("/3DReconstruction")
@Slf4j
public class FileController extends BaseController {

    @Resource
    private FileUtil fileUtil;

    @PostMapping("/upload")
    public CommonReturnType uploadFiles(HttpServletRequest request, HttpServletResponse response, @RequestParam("uid") int uid) throws BusinessException {

        MultipartHttpServletRequest MuRequest = (MultipartHttpServletRequest) request;
        Map<String, MultipartFile> multipartFiles = MuRequest.getFileMap();
//        log.info(String.valueOf(multipartFiles.size()));
        if (multipartFiles.size() == 0) {
            throw new BusinessException(EmBusinessError.PARAMETER_VALIDATION_ERROR);
        }

//        List<String> names = new ArrayList<>();
        for (MultipartFile multipartFile:multipartFiles.values()) {
            fileUtil.uploadFile(multipartFile, uid);
//            names.add(name);
        }
        return CommonReturnType.create(null);
    }

    @PostMapping("/reconstruction")
    public CommonReturnType recon(@RequestParam("focal") String focal,
                                  @RequestParam("dist1") String dist1,
                                  @RequestParam("dist2") String dist2,
                                  @RequestParam("dist3") String dist3,
                                  @RequestParam("dist4") String dist4,
                                  @RequestParam("dist5") String dist5,
                                  @RequestParam("k00") String k00,
                                  @RequestParam("k02") String k02,
                                  @RequestParam("k11") String k11,
                                  @RequestParam("k12") String k12) throws IOException {

        fileUtil.createFile("focal.txt", focal);
        fileUtil.createFile("dist1.txt", dist1);
        fileUtil.createFile("dist2.txt", dist2);
        fileUtil.createFile("dist3.txt", dist3);
        fileUtil.createFile("dist4.txt", dist4);
        fileUtil.createFile("dist5.txt", dist5);
        fileUtil.createFile("k00.txt", k00);
        fileUtil.createFile("k02.txt", k02);
        fileUtil.createFile("k11.txt", k11);
        fileUtil.createFile("k12.txt", k12);

        runPy("/Users/Amon/Desktop/_3D-reconstruction/Reconstruction/3D_RE.py");
        return CommonReturnType.create(null);
    }

    @GetMapping("/calibration")
    public CommonReturnType recon() throws IOException {
        runPy("/Users/Amon/Desktop/_3D-reconstruction/Reconstruction/reconstruct/calibrate.py");
        String str = fileUtil.readJsonFile("/Users/Amon/Desktop/_3D-reconstruction/Reconstruction/record.json");
        if (str == null) {
            return CommonReturnType.create(null);
        } else {
            JSONObject jsonObject = JSON.parseObject(str);
            return CommonReturnType.create(jsonObject);
        }
    }

    private void runPy(String pyFile) {
        try {
//            log.info("start");
            String[] args1 = new String[]{"/Library/Frameworks/Python.framework/Versions/3.7/bin/python3.7", pyFile};
            Process pr = Runtime.getRuntime().exec(args1);

            pr.waitFor();
//            log.info("end");
        } catch (Exception e) {
            e.printStackTrace();
        }

    }
}
