import { Cheerio, CheerioAPI, load } from "cheerio"
import { AnyNode, Element } from 'domhandler'

export interface SchoolData {
  name: string
  rmpUrl: string
}

export interface ProfessorData {
  name: string
  rmpUrl: string
  school: SchoolData | null
}

export interface ReviewRatings {
  qualityRating: number
  difficultyRating: number
}

export interface ReviewData extends ReviewRatings {
  content: string
  subjectName: string
  publishedAt: Date
}

interface ScrapedResult {
  professor: ProfessorData
  reviews: ReviewData[]
}


// #region Helpers

const RMP_BASE_URL = "https://www.ratemyprofessors.com"

const isValidURL = (url: string) => {
  if (!url) {
    return false
  }
  try {
    new URL(url)
    return true
  }
  catch (error) {
    return false
  }
}

const getPageHTML = async (url: string) => {
  const resp = await fetch(url)
  if (!resp.ok) {
    throw new Error(`Failed to fetch page: ${resp.statusText}`)
  }
  return await resp.text()
}

/**
 * Helper function to generate a CSS selector that matches elements with a class prefix.
 */
const classStartsWith = (className: string) => `[class^="${className}"]`


/**
 * Converts a date string to a Date object.
 */
const dateStrToDateObj = (dateStr: string) => {
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

const parseProfessorInfo = ($: CheerioAPI, preofessorElement: AnyNode) => {
  const schoolElement = $(preofessorElement)
    .find(classStartsWith('NameTitle__Title'))
    .find('a[href^="/school"]')[0]
  const teacher = {
    name: $(preofessorElement)
      .find(classStartsWith('NameTitle__Name'))
      .text().trim(),
    school: schoolElement
      ? ({
        name: $(schoolElement).text().trim(),
        rmpUrl: `${RMP_BASE_URL}${$(schoolElement).attr('href')}`,
      })
      : null
  }
  return teacher
}

const retrieveProfessor = ($: CheerioAPI, url: string, teacherElement: AnyNode) => {
  const teacher = parseProfessorInfo($, teacherElement)
  return {
    rmpUrl: url,
    ...teacher,
  }
}

// #endregion


// #region Reviews Data Retriever

const parseReviewRatings = ($: CheerioAPI, reviewElement: Element) => {
  const ratingValues = $(reviewElement)
    .find(classStartsWith('RatingValues__StyledRatingValues'))
    .find(classStartsWith('CardNumRating__StyledCardNumRating'))

  const rawRatings: { header: string, number: number }[] = []
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
    qualityRating: rawRatings.find(rating => rating.header === "quality")!.number,
    difficultyRating: rawRatings.find(rating => rating.header === "difficulty")!.number,
  }
  return ratings
}

const parseReviewInfo = ($: CheerioAPI, reviewElement: Element) => {
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

const retrieveReview = ($: CheerioAPI, reviewElement: Element) => {
  const reviewRatings = parseReviewRatings($, reviewElement)
  const reviewInfo = parseReviewInfo($, reviewElement)
  const review = {
    ...reviewInfo,
    ...reviewRatings,
  }
  return review
}

const retrieveReviews = ($: CheerioAPI, reviewListElement: Cheerio<Element>) => {
  const reviews: ReviewData[] = []
  reviewListElement.each((_, element) => {
    reviews.push(retrieveReview($, element))
  })
  return reviews
}

// #endregion


export const scrapeProfessorReviews = async (url: string): Promise<ScrapedResult> => {
  // Check if the URL is valid
  if (!isValidURL(url)) {
    throw new Error("Invalid URL")
  }
  if (!url.startsWith(`${RMP_BASE_URL}/professor/`)) {
    throw new Error("Invalid Rate My Professor URL: Only professor URLs are supported")
  }

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
