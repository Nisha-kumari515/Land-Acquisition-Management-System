import { prisma } from '../config/database.js';
import { AppError } from '../utils/response.js';

export const getCitizenParcelStatus = async (req, res, next) => {
    try {
        const { identifier } = req.params; // Can be ULPIN or DAG No

        // Find the parcel
        const parcel = await prisma.parcel.findFirst({
            where: {
                OR: [
                    { ulpin: identifier },
                    { dagNo: identifier }
                ]
            },
            include: {
                projectParcels: {
                    include: {
                        project: {
                            select: {
                                name: true,
                                department: true,
                                status: true
                            }
                        },
                        acquisitionCase: {
                            include: {
                                compensation: {
                                    select: {
                                        status: true,
                                        assessedAmount: true // Do not return bank details, just status
                                    }
                                }
                            }
                        },
                        rrFamilies: {
                            select: {
                                status: true,
                                eligible: true,
                                resettlementProgress: true
                            }
                        }
                    }
                }
            }
        });

        if (!parcel) {
            return next(new AppError(404, 'NOT_FOUND', 'Parcel not found'));
        }

        // Return a sanitized subset of data
        res.json({
            status: 'success',
            data: {
                ulpin: parcel.ulpin,
                dagNo: parcel.dagNo,
                area: parcel.area,
                village: parcel.village,
                projects: parcel.projectParcels.map(pp => ({
                    projectName: pp.project.name,
                    department: pp.project.department,
                    affectedArea: pp.affectedArea,
                    acquisitionStage: pp.acquisitionStage,
                    compensationStatus: pp.acquisitionCase?.compensation?.status || 'PENDING',
                    rrStatus: pp.rrFamilies.length > 0 ? pp.rrFamilies[0].status : 'N/A'
                }))
            }
        });
    } catch (error) {
        next(error);
    }
};
