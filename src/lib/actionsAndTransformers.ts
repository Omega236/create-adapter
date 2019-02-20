import { yellow } from "ansi-colors";
import { licenses } from "./licenses";
import { fetchPackageVersion } from "./packageVersions";
import { ResultTransform } from "./questions";

const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export type CheckResult = true | string;
export async function checkMinSelections(category: string, min: number, answers: any[]): Promise<CheckResult> {
	if (answers.length >= min) return true;
	return `Please enter at least ${min} ${category}`;
}

function isAdapterNameValid(name: string): CheckResult {
	if (!isNotEmpty(name)) {
		return "Please enter a valid name!";
	}
	const forbiddenChars = /[^a-z0-9\-_]/g;
	if (forbiddenChars.test(name)) {
		return `The name may only consist of lowercase letters, numbers, "-" and "_"!`;
	}
	if (!/^[a-z]/.test(name)) {
		return `The name must start with a letter!`;
	}
	if (!/[a-z0-9]$/.test(name)) {
		return `The name must end with a letter or number!`;
	}
	return true;
}

async function checkAdapterExistence(name: string): Promise<CheckResult> {
	try {
		await fetchPackageVersion(`iobroker.${name}`);
		return `The adapter ioBroker.${name} already exists!`;
	} catch (e) {
		return true;
	}
}

export async function checkAdapterName(name: string): Promise<CheckResult> {
	const validCheck = isAdapterNameValid(name);
	if (typeof validCheck === "string") return validCheck;

	const existenceCheck = await checkAdapterExistence(name);
	if (typeof existenceCheck === "string") return existenceCheck;

	return true;
}

export function checkTitle(title?: string): CheckResult {
	if (!isNotEmpty(title)) {
		return "Please enter a title!";
	}
	if (/iobroker|adapter/i.test(title)) {
		return `The title must not contain the words "ioBroker" or "adapter"!`;
	}
	return true;
}

function isNotEmpty(answer?: string): answer is string {
	return answer != undefined && answer.length > 0 && answer.trim().length > 0;
}

export async function checkAuthorName(name?: string): Promise<CheckResult> {
	if (!isNotEmpty(name)) {
		return "Please enter a valid name!";
	}
	return true;
}

export async function checkEmail(email: string): Promise<CheckResult> {
	if (!emailRegex.test(email)) {
		return "Please enter a valid email address!";
	}
	return true;
}

export const transformAdapterName: ResultTransform<string> = function(answerName, adapterName) {
	const startsWithIoBroker = /^ioBroker\./i;
	if (startsWithIoBroker.test(adapterName)) {
		this.value = adapterName.replace(startsWithIoBroker, "");
		console.log(yellow(`You don't have to prefix the name with "ioBroker."`));
	}
	return true;
};

export const transformDescription: ResultTransform<string> = function(answerName, description) {
	description = description.trim();
	if (description.length === 0) this.value = undefined;
	return true;
};

export const licenseIDToLicense: ResultTransform<any> = function(answerName, licenseID) {
	this.value = licenses[licenseID];
	return true;
};
