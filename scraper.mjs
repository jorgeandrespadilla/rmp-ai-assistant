import { load } from "cheerio"

// #region Helpers

const getPageHTML = async (url) => {
  const resp = await fetch(url)
  return await resp.text()
}

/**
 * Helper function to generate a CSS selector that matches elements with a class prefix.
 */
const classStartsWith = (className) => `[class^="${className}"]`


/**
 * Converts a date string to a Date object.
 */
const dateStrToDateObj = (dateStr) => {
  // Remove the "th", "st", "nd", "rd" from the day
  const cleanedDateStr = dateStr.replace(/(st|nd|rd|th)/, '');
  const dateObj = new Date(cleanedDateStr);
  
  if (isNaN(dateObj.getTime())) {
    throw new Error("Invalid date format");
  }

  return dateObj
};

// #endregion


// #region Professor Data Retriever

const parseProfessorInfo = ($, teacherElement) => {
  const schoolElement = $(teacherElement)
    .find(classStartsWith('NameTitle__Title'))
    .find('a[href^="/school"]')[0]
  const teacher = {
    name: $(teacherElement)
      .find(classStartsWith('NameTitle__Name'))
      .text().trim(),
    school: schoolElement
      ? ({
        name: $(schoolElement).text().trim(),
        rmpUrl: `https://www.ratemyprofessors.com${$(schoolElement).attr('href')}`,
      })
      : null
  }
  return teacher
}

const retrieveProfessor = ($, url, teacherElement) => {
  const teacher = parseProfessorInfo($, teacherElement)
  return {
    rmpUrl: url,
    ...teacher,
  }
}

// #endregion


// #region Reviews Data Retriever

const parseReviewRatings = ($, reviewElement) => {
  const ratingValues = $(reviewElement)
    .find(classStartsWith('RatingValues__StyledRatingValues'))
    .find(classStartsWith('CardNumRating__StyledCardNumRating'))

  const rawRatings = []
  ratingValues.each((_, element) => {
    rawRatings.push({
      header: $(element)
        .find(classStartsWith('CardNumRating__CardNumRatingHeader'))
        .text().trim().toLowerCase(),
      number: Number(
        $(element)
          .find(classStartsWith('CardNumRating__CardNumRatingNumber'))
          .text().trim()
      ),
    })
  })

  const ratings = {
    qualityRating: rawRatings.find(rating => rating.header === "quality").number,
    difficultyRating: rawRatings.find(rating => rating.header === "difficulty").number,
  }
  return ratings
}

const parseReviewInfo = ($, reviewElement) => {
  const reviewInfoElement = $(reviewElement)
    .find(classStartsWith('Rating__RatingInfo'))[0]
  const reviewInfoHeaderElement = $(reviewInfoElement)
    .find(classStartsWith('RatingHeader__StyledHeader'))
  
  const review = {
    subjectName: $(reviewInfoHeaderElement)
      .find(classStartsWith('RatingHeader__StyledClass'))
      .text().trim(),
    publishedAt: dateStrToDateObj(
      $(reviewInfoHeaderElement)
        .find(classStartsWith('TimeStamp__StyledTimeStamp'))
        .text().trim()
    ),
    content: $(reviewElement)
      .find(classStartsWith('Comments__StyledComments'))
      .text().trim(),
  }
  return review
}

const retrieveReview = ($, reviewElement) => {
  const reviewRatings = parseReviewRatings($, reviewElement)
  const reviewInfo = parseReviewInfo($, reviewElement)
  const review = {
    ...reviewInfo,
    ...reviewRatings,
  }
  return review
}

const retrieveReviews = ($, reviewListElement) => {
  const reviews = []
  reviewListElement.each((_, element) => {
    reviews.push(retrieveReview($, element))
  })
  return reviews
}

// #endregion


const scrapeProfessorReviews = async (url) => {
  const html = await getPageHTML(url)
  const $ = load(html)

  const professorInfoElement = $(classStartsWith('TeacherInfo__StyledTeacher'))[0]
  if (!professorInfoElement) {
    throw new Error("Page not found")
  }
  const professor = retrieveProfessor($, url, professorInfoElement)

  // With this selector, we ensure that we are only selecting the reviews (we exclude any other elements that might be present in the list such as ads)
  const reviewListElement = $(`ul#ratingsList > li > div${classStartsWith('Rating__StyledRating')}`)
  const reviews = retrieveReviews($, reviewListElement)

  return {
    professor,
    reviews
  }
}

const main = async () => {
  try {
    const data = await scrapeProfessorReviews("https://www.ratemyprofessors.com/professor/1")
    console.log("Reviews found:", data.reviews.length)
    console.log(data)
  } catch (error) {
    console.error(error)
  }
}

main()
