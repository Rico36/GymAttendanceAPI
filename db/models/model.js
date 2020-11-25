module.exports = mongoose => {
    const WellnessCenter_db = mongoose.model(
      "WellnessCenter",
      mongoose.Schema(
        {
          hhsid: String,
          userid: String,
          Firstname: String,
          Lastname: String,
          Registered: Boolean
        },
        { timestamps: true }
      )
    );
  
    return WellnessCenter_db;
  };