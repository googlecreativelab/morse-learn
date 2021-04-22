// Docs on event and context https://www.netlify.com/docs/functions/#the-handler-method
// get the client
const mysql = require("mysql2");
const {
  v4: uuidv4,
  version: uuidVersion,
  validate: uuidValidate,
} = require("uuid");
const cookie = require('cookie')

// create the connection to database
const connection = mysql.createConnection({
  host: "cip-109-107-38-255.gb1.brightbox.com",
  user: "morse_learn",
  database: "morse_learn",
  password: process.env.DB_PASSWORD,
});

// TODO: Create a new row if user changes settings
// TODO: Check that howManyCorrectAnswersToLearn is correct

const handler = async (event, context) => {
  try {
    // Only allow POST requests
    if (event.httpMethod.toUpperCase() !== "POST") {
      return {
        statusCode: 404,
        body: "Not found",
      };
    }

    const body = JSON.parse(event.body);
    const timePlayed = body.timePlayed;
    const sound = body.sound;
    const speechHints = body.speechHints;
    const visualHints = body.visualHints;
    const progressDump = body.progress;
    const progressPercent = calculateProgressPercent(progressDump);
    const settingsDump = {
      sound,
      speechHints,
      visualHints,
    };

    // If any of these values aren't set its easier to bail as early as we can
    // and give a useful error message
    throwIfUndefinedOrNull(timePlayed, "timePlayed");
    throwIfUndefinedOrNull(sound, "sound");
    throwIfUndefinedOrNull(speechHints, "speechHints");
    throwIfUndefinedOrNull(visualHints, "visualHints");
    throwIfUndefinedOrNull(progressDump, "progressDump");
    throwIfUndefinedOrNull(progressPercent, "progressPercent");
    throwIfUndefinedOrNull(settingsDump, "settingsDump");

    // Get the userId (or a new one if one isnt given)
    const userIdentifier = getUserIdCookie(event.headers.cookie);
    const userAggregate = await getAggregateRow(connection, userIdentifier);

    // Its a new user so lets insert them
    if (!userAggregate) {
      await query(
        connection,
        `
      INSERT INTO user_aggregate 
      (userIdentifier, progressDump, progressPercent, timePlayed, dateCreated, visualHints, speechHints, sound, settingsDump)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
        [
          userIdentifier,
          JSON.stringify(progressDump),
          progressPercent,
          timePlayed,
          new Date(),
          visualHints,
          speechHints,
          sound,
          JSON.stringify(settingsDump),
        ]
      );
    } else {
      // If its an existing user lets update them
      await query(
        connection,
        `
      UPDATE user_aggregate
      SET
        progressDump = ?,
        progressPercent = ?,
        timePlayed = ?,
        visualHints = ?,
        speechHints = ?,
        sound = ?,
        settingsDump = ?
      WHERE userIdentifier = ?;
    `,
        [
          JSON.stringify(progressDump),
          progressPercent,
          timePlayed,
          visualHints,
          speechHints,
          sound,
          JSON.stringify(settingsDump),
          userIdentifier,
        ]
      );
    }

    // We always want to add a progress log
    await query(
      connection,
      `
    INSERT INTO progress_log 
    (userIdentifier, progressDump, progressPercent, timePlayed, dateCreated, visualHints, speechHints, sound, settingsDump)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
      [
        userIdentifier,
        JSON.stringify(progressDump),
        progressPercent,
        timePlayed,
        new Date(),
        visualHints,
        speechHints,
        sound,
        JSON.stringify(settingsDump),
      ]
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Successfully logged progress for ${userIdentifier}` }),
      headers: {
        'Set-Cookie': cookie.serialize('userIdentifier', userIdentifier, {
          httpOnly: true,
          path: '/',
          maxAge: 2147483647, // Largest max age allowed
        }),
      }
    };
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
};

const calculateProgressPercent = (progress) => {
  // Once the user has answered a letter correct x times we say they have learned it
  const howManyCorrectAnswersToLearn = 4;
  const noOfLettersInTheAlphabet = Object.keys(progress).length;
  const totalLetterAnswersCorrect = Object.values(progress).reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0
  );
  const hundredPercent =
    noOfLettersInTheAlphabet * howManyCorrectAnswersToLearn;

  const rawPercent = (totalLetterAnswersCorrect * 100) / hundredPercent;

  return Math.floor(rawPercent);
};

const throwIfUndefinedOrNull = (value, key) => {
  if (value === null || value === undefined) {
    throw new Error("Value not defined: ", key);
  }
};

const getAggregateRow = async (currentConnection, userId) => {
  // Bail early if there is no userId
  if (userId === null) return null;

  const { results } = await query(
    currentConnection,
    `
    SELECT * FROM user_aggregate WHERE userIdentifier = ?;
  `,
    [userId]
  );

  if (results.length === 0) return null;

  return results[0];
};

// Wrap database query in a promise so we can await it
const query = (currentConnection, query, params) => {
  return new Promise((res, rej) => {
    currentConnection.query(query, params, function (err, results, fields) {
      if (err) return rej(err);
      res({ results, fields });
    });
  });
};

// Parse the cookie for valid useridentifier.
// Return a new id if it cant find one
const getUserIdCookie = (cookies = "") => {
  // Return new UUID if no cookies
  if (!cookies) return uuidv4();

  const split = cookies.split(";");
  const keyValues = split.map((x) => x.split("="));

  let userId = null;

  for (const [key, value] of keyValues) {
    if (key.trim().toLowerCase() === "useridentifier") {
      userId = value.trim().toLowerCase();
    }
  }

  // Return new UUID if no cookie with the key 'useridentifier'
  if (userId === null) return uuidv4();

  // Return the userId if the id is a valid uuid
  if (isValidId(userId)) return userId;

  // Return new UUID if the cookie is not a valid uuid
  return uuidv4();
};

function isValidId(uuid) {
  return uuidValidate(uuid) && uuidVersion(uuid) === 4;
}

module.exports = { handler };
