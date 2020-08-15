package com.cj.reconstruction.util;

import com.cj.reconstruction.error.BusinessException;
import com.cj.reconstruction.error.EmBusinessError;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.util.Objects;

/**
 * @author Nightnessss
 */
@Component
@Slf4j
public class FileUtil {
//    private final String URL = "/home/cj/project/_3D-reconstruction/img/";
    private String URL = "/Users/Amon/Desktop/_3D-reconstruction/Reconstruction/reconstruct_this/";
    private final String[] type = {".jpg", ".png", ".jpeg"};


    public String uploadFile(MultipartFile multipartFile, int uid) throws BusinessException {
        if (uid == 1) {
            URL = "/Users/Amon/Desktop/_3D-reconstruction/Reconstruction/reconstruct_this/";
        } else if (uid == 2) {
            URL = "/Users/Amon/Desktop/_3D-reconstruction/Reconstruction/calibration_images/";
        }

        byte[] file = new byte[0];
        try {
            file = multipartFile.getBytes();
        } catch (IOException e) {
            e.printStackTrace();
        }
        File targetFile = new File(URL);
        if(!targetFile.exists()){
            targetFile.mkdirs();
        }
        //这里调用了UUID，得到全宇宙唯一的命名
//        UUID uuid = UUID.randomUUID();
        // 真正的UUID打印出来是这样的：xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (8-4-4-4-12)
//        String str = uuid.toString();
        //所以我们可以去掉去掉"-"符号
//        String rename = str.replace("-", "");

        // 获取文件后缀
        String suffix = Objects.requireNonNull(multipartFile.getOriginalFilename()).substring(multipartFile.getOriginalFilename().lastIndexOf("."));
        if (!StringUtils.equalsIgnoreCase(suffix, type[0]) &&
                !StringUtils.equalsIgnoreCase(suffix, type[1]) &&
                !StringUtils.equalsIgnoreCase(suffix, type[2])) {
            throw new BusinessException(EmBusinessError.PARAMETER_VALIDATION_ERROR, "上传图片后缀必须是png、jpg、JPEG");
        }
//        if (StringUtils.equalsIgnoreCase(suffix, type[0])) {
//            suffix = type[0];
//        } else if (StringUtils.equalsIgnoreCase(suffix, type[1])) {
//            suffix = type[1];
//        } else if (StringUtils.equalsIgnoreCase(suffix, type[2])) {
//            suffix = type[2];
//        }
        // 重命名+修改后缀
        suffix = type[2];
        int i = 0;
        String rename = i + suffix;
        while (new File(URL + i + type[0]).exists() ||
                new File(URL + i + type[1]).exists() ||
                new File(URL + i + type[2]).exists()) {
            rename  = ++i + suffix;
        }
        FileOutputStream out = null;
        try {
            out = new FileOutputStream(URL + rename);
            out.write(file);
//            log.info("upload: " + URL + rename);
            out.flush();
            out.close();
        } catch (IOException e) {
            throw new BusinessException(EmBusinessError.UPLOAD_ERROR);
        }
        return rename;
    }

    public void createFile(String fileName, String content) throws IOException {
        String filePath = "/Users/Amon/Desktop/_3D-reconstruction/Reconstruction/camera_params/";
        File dir = new File(filePath);
        // 一、检查放置文件的文件夹路径是否存在，不存在则创建
        if (!dir.exists()) {
            dir.mkdirs();// mkdirs创建多级目录
        }
        File checkFile = new File(filePath + fileName);
        FileWriter writer = null;
        try {
            // 二、检查目标文件是否存在，不存在则创建
            if (!checkFile.exists()) {
                checkFile.createNewFile();// 创建目标文件
            }
            // 三、向目标文件中写入内容
            // FileWriter(File file, boolean append)，append为true时为追加模式，false或缺省则为覆盖模式
            writer = new FileWriter(checkFile, false);
            writer.append(content);
            writer.flush();
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            if (null != writer)
                writer.close();
        }
    }


    public String readJsonFile(String fileName) {
        String jsonStr = "";
        try {
            File jsonFile = new File(fileName);
            FileReader fileReader = new FileReader(jsonFile);

            Reader reader = new InputStreamReader(new FileInputStream(jsonFile),"utf-8");
            int ch = 0;
            StringBuffer sb = new StringBuffer();
            while ((ch = reader.read()) != -1) {
                sb.append((char) ch);
            }
            fileReader.close();
            reader.close();
            jsonStr = sb.toString();
            return jsonStr;
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }
}