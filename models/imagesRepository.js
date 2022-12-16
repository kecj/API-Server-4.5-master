const ImageFilesRepository = require("./imageFilesRepository.js");
const UsersRepository = require("./usersRepository");
const ImageModel = require("./image.js");
const utilities = require("../utilities");
const { locale } = require("date-and-time");
const User = require("./user.js");
const HttpContext = require("../httpContext").get();

module.exports = class ImagesRepository extends require("./repository") {
  constructor() {
    super(new ImageModel(), true /* cached */);
    this.setBindExtraDataMethod(this.bindImageURL);
  }
  bindImageURL(image) {
    if (image) {
      let bindedImage = { ...image };
      if (image["GUID"] != "") {
        bindedImage["OriginalURL"] =
          HttpContext.host +
          ImageFilesRepository.getImageFileURL(image["GUID"]);
        bindedImage["ThumbnailURL"] =
          HttpContext.host +
          ImageFilesRepository.getThumbnailFileURL(image["GUID"]);
      } else {
        bindedImage["OriginalURL"] = "";
        bindedImage["ThumbnailURL"] = "";
      }
      if (image["UserId"] != 0) {
        let userRepository = new UsersRepository();
        const user = userRepository.get(image["UserId"]);
        if (user) {
          bindedImage["Username"] = user.Name;
          bindedImage["AvatarURL"] =
            HttpContext.host +
            ImageFilesRepository.getImageFileURL(user["AvatarGUID"]);
        }
      }
      return bindedImage;
    }
    return null;
  }
  add(image) {
    if (this.model.valid(image)) {
      image["GUID"] = ImageFilesRepository.storeImageData(
        "",
        image["ImageData"]
      );
      delete image["ImageData"];
      return this.bindImageURL(super.add(image));
    }
    return null;
  }
  update(image) {
    if (this.model.valid(image)) {
      image["GUID"] = ImageFilesRepository.storeImageData(
        image["GUID"],
        image["ImageData"]
      );
      delete image["ImageData"];
      return super.update(image);
    }
    return false;
  }
  remove(id) {
    let foundImage = super.get(id);
    if (foundImage) {
      ImageFilesRepository.removeImageFile(foundImage["GUID"]);
      return super.remove(id);
    }
    return false;
  }
  getAll(params = null) {
    let images = super.getAll(params);
    if (params?.keywords != null) {
      let keywords = params.keywords.split(" ");
      if (keywords.length > 0) {
        return images.filter((image) => {
          let text = (image.Title + " " + image.Description).toLowerCase();
          return keywords.every((keyword) => text.indexOf(keyword) >= 0);
        });
      }
    }
    return images;
  }
};
