import axios from "axios";

const Log = async (
  stack,
  level,
  packageName,
  message,
  token
) => {
  try {
    const response = await axios.post(
      "http://4.224.186.213/evaluation-service/logs",
      {
        stack,
        level,
        package: packageName,
        message,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (err) {
    console.log(err.message);
  }
};

export default Log;